"use client";
import Header from "@/components/layout/Header/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.scss";
import FAQ from "@/components/layout/FAQ/FAQ";
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body>
        <Script
          type="text/javascript"
          id="yandex-metrika"
          strategy="afterInteractive"
        >
          {`(function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
          
          ym(105768630, 'init', {
            clickmap:true,
            trackLinks:true,
            accurateTrackBounce:true,
            webvisor:true,
            ecommerce:"dataLayer"
          });`}
        </Script>
        
        <noscript>
          <div>
            <img 
              src="https://mc.yandex.ru/watch/105768630" 
              style={{position: "absolute", left: "-9999px"}} 
              alt="" 
            />
          </div>
        </noscript>

        <Header />
        <main className="container">{children}</main>
        <FAQ />
        <ToastContainer />
      </body>
    </html>
  );
}