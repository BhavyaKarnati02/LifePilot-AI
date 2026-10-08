import './globals.css';import {LifePilotProvider} from '@/lib/lifepilot-store';import {Nav} from '@/components/nav'
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><LifePilotProvider><div className="shell"><Nav/>{children}</div></LifePilotProvider></body></html>}
