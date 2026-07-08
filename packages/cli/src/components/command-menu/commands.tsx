import type { Command } from "./types";

export const COMMANDS: Command[] = [
  {
    name: "new",
    description: "Start a new conversation",
    value: "/new",
    action: (ctx) => {
      ctx.toast.show({message: "Starting new conversation..."})
    }
  },
  {
    name: "exit",
    description: "Quit the application",
    value: "/exit",
    action: (ctx) => {
      ctx.exit();
      ctx.toast.show({message: "Quiting Application..."})
    },
  },
  {
    name: "agents",
    description: "Switch agents",
    value: "/agents",
    action: (ctx) => {
      ctx.toast.show({message: "Switching Agents..."})
    },
  },
  {
    name: "models",
    description: "Switch AI model for generation",
    value: "/models",
    action: (ctx) => {
      ctx.toast.show({message: "Switching Models..."})
    },
  },
  {
    name: "session",
    description: "Browse past sessions",
    value: "/agents",
    action: (ctx) => {
      ctx.toast.show({message: "Opening Sessions..."})
    },
  },
  {
    name: "theme",
    description: "Change color theme",
    value: "/agents",
    action: (ctx) => {
      ctx.toast.show({message: "Opening Themes..."})
    },
  },
];
