import Head from "next/head";
import Image from 'next/image';
import { useRouter } from 'next/router'
import { useState } from "react";
import FightCollapser from "~/components/FightCollapser";
import { getParamsFromUrl } from "~/server/utils";

import { api } from "~/utils/api";
import { msToDuration } from "~/utils/log-utils";

export default function Home() {
  const [logUrl, setLogUrl] = useState("");
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Mitty</title>
        <meta name="description" content="FFlogs Mit Analyzer by @mczub" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <Image src="/mitty.png" alt="a perfect mit" width={120} height={300}/>
          <form className="relative w-3/5" 
            onSubmit={(event) => {
              event.preventDefault();
              const urlParams = getParamsFromUrl(logUrl);
              if (urlParams.isValid) router.push(`/${urlParams.reportCode}/${urlParams.fightId ?? ''}`)
            }}
          >
            <div>
              <input 
                type="text" 
                name="logUrl"
                className="input input-bordered w-full" 
                placeholder="FFLogs URL" 
                value={logUrl}
                onChange={(e) => setLogUrl(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary btn-sm absolute end-2 bottom-2">Get Log</button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
