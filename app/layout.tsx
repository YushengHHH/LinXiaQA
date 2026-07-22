import type {Metadata} from "next";
import {headers} from "next/headers";
import "./globals.css";
export async function generateMetadata():Promise<Metadata>{const host=(await headers()).get("host")||"linxia-wenlu.merry-poppy-9521.chatgpt.site";const base=new URL(`https://${host}`);return{title:"林下问路｜知道管理的组织路径沙盘",description:"三问知境，三卦见势，三路寻优。一套面向复杂组织处境的诊断、趋势推演与自适应进化系统。",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"},openGraph:{title:"林下问路",description:"知境，而后知道。",images:[new URL("/og.png",base).toString()]},twitter:{card:"summary_large_image",title:"林下问路",description:"知境，而后知道。",images:[new URL("/og.png",base).toString()]}}}
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
