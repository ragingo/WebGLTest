import { Application } from "./app/Application";
import { MainFrame } from "./app/MainFrame";

Application.registerAppFrame(new MainFrame());
Application.main();
