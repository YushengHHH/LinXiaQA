import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"林下问路｜把处境变成一条可以试走的路",description:"不是替你选路，而是陪你看清脚下。从一问开始，辨认路标、岔路与下一步。",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
