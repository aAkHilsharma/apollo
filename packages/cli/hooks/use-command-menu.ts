import { ScrollBoxRenderable } from "@opentui/core";
import { useMemo, useRef, useState, type RefObject } from "react";
import type { Command } from "../src/components/command-menu/types";
import { getFilteredCommands } from "../src/components/command-menu/filter-command";
import { useKeyboard } from "@opentui/react";
import { useKeyboardLayer } from "../src/providers/keyboard-layer";

type UseCommandMenuReturn = {
  showCommandMenu: boolean;
  commandQuery: string;
  selectedIndex: number;
  scrollref: RefObject<ScrollBoxRenderable | null>;
  handleContentChange: (text: string) => void;
  resolveCommand: (index: number) => Command | undefined;
  setSelectedIndex: (index: number) => void;
};

export function UseCommandMenu(): UseCommandMenuReturn {
  const [textValue, setTextValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const scrollref = useRef<ScrollBoxRenderable>(null);
  const { push, pop, isTopLayer } = useKeyboardLayer()

  const commandQuery =
    showCommandMenu && textValue.startsWith("/") ? textValue.slice(1) : "";

  const filteredCommands = useMemo(() => {
    return getFilteredCommands(commandQuery);
  }, [commandQuery]);

  const close = () => {
    setShowCommandMenu(false);
    pop("command");
  };

  const handleContentChange = (text: string) => {
    setTextValue(text);
    setSelectedIndex(0);

    const scrollbox = scrollref.current;
    if (scrollbox) {
      scrollbox.scrollTo(0);
    }

    const prefix = text.startsWith("/") ? text.slice(1) : null;
    if (prefix !== null && !prefix.includes(" ")) {
      setShowCommandMenu(true);
      push("command", () => {
        close();
        return true;
      })
    } else {
      close();
    }
  };

  const resolveCommand = (index: number): Command | undefined => {
    const command = filteredCommands[index];
    if (command) {
      close();
    }
    return command;
  };

  useKeyboard((key) => {
    if (!showCommandMenu || !isTopLayer("command")) return;

    if (key.name === "escape") {
      key.preventDefault();
      close();
    } else if (key.name === "up") {
      setSelectedIndex((i: number) => {
        key.preventDefault();
        const newIndex = Math.max(0, i - 1);

        const sb = scrollref.current;
        if (sb && newIndex < sb.scrollTop) {
          sb.scrollTo(newIndex);
        }

        return newIndex;
      });
    } else if (key.name === "down") {
      setSelectedIndex((i: number) => {
        key.preventDefault();
        const newIndex = Math.min(filteredCommands.length - 1, i + 1);

        const sb = scrollref.current;
        if (sb) {
          const viewPortHeight = sb.viewport.height;
          const visibleEnd = sb.scrollTop + viewPortHeight - 1;

          if (newIndex > visibleEnd) {
            sb.scrollTo(newIndex - viewPortHeight + 1);
          }
        }

        return newIndex;
      });
    }
  });

  return {
    showCommandMenu,
    commandQuery,
    selectedIndex,
    scrollref,
    handleContentChange,
    resolveCommand,
    setSelectedIndex,
  };
}
