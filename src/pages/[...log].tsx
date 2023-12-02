import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FightCollapser from "~/components/FightCollapser";

import { api } from "~/utils/api";
import { msToDuration } from "~/utils/log-utils";

export default function Page() {
  const [reportCode, setReportCode] = useState("");
  const [fightId, setFightId] = useState("");
  const router = useRouter();
  useEffect(()=>{
    if(!router.isReady) return;
    if (!router.query.log) {
      router.push('/');
      return;
    }

    setReportCode(router.query.log[0] ?? "");
    setFightId(router.query.log[1] ?? "");

  }, [router.isReady, router.query]);
  
  const reportData = api.post.getReportData.useQuery({reportCode: reportCode}, {enabled: !!reportCode});
  const logData = api.post.getLogData.useQuery({reportCode: reportCode, fightId: fightId}, {enabled: !!(reportCode && fightId)});
  const phaseInfo = api.post.getFightPhaseInfo.useQuery();
  const phaseFightTimelines = api.post.getPhaseFightTimelines.useQuery();
  const phaseMitTimelines = api.post.getPhaseMitTimelines.useQuery();

  const fightInfo = logData?.data?.fightData?.reportData?.report?.fights[0];
  const reportInfo = reportData?.data?.fightData?.reportData?.report;

  return (
    <>
      <Head>
        <title>Mitty</title>
        <meta name="description" content="FFlogs Mit Analyzer by @mczub" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <div className="navbar bg-base-100">
            <div className="flex-none">
              <Link href="/" className="btn btn-square btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"></path></svg>
              </Link>
            </div>
            <details className='dropdown flex-1' open={!fightInfo}>
              <summary className="m-1 btn btn-ghost text-xl h-[4rem]">
                {reportInfo ? 
                  (<span className="mr-2"><div>{reportInfo.title}</div> <div className="text-sm text-left">{new Date(reportInfo.startTime).toLocaleDateString()}</div></span>) : 
                  (<span className="loading loading-dots loading-sm"></span>)
                }
                <svg className="w-[12px] h-[12px] text-gray-800 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 10">
                  <path d="M15.434 1.235A2 2 0 0 0 13.586 0H2.414A2 2 0 0 0 1 3.414L6.586 9a2 2 0 0 0 2.828 0L15 3.414a2 2 0 0 0 .434-2.179Z"/>
                </svg>
              </summary>
              <ul className="p-2 shadow menu dropdown-content z-[50] bg-base-100 rounded-box w-80">
                {reportInfo?.fights.map((report: any) => {
                  return(
                    <li><Link href={`/${reportCode}/${report.id}`}>
                      #{report.id} <span className="font-semibold">{report.name}</span> P{report.lastPhase} {report.bossPercentage}%
                    </Link></li>
                  )
                })}
              </ul>
            </details>
            <a href={`https://fflogs.com/reports/${reportCode}#fight=${fightId}`} target="_blank" rel="noopener noreferrer" className="btn">
              Open in FFLogs
              <svg className="w-[20px] h-[20px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"/>
              </svg>
            </a>
          </div>
          {fightId && fightInfo && fightInfo.name === "The Omega Protocol" && <div className="w-full">
            {logData.data?.fightData && phaseInfo?.data && phaseFightTimelines?.data && phaseMitTimelines?.data ? 
              <FightCollapser props={{phaseInfo: phaseInfo.data, phaseFightTimelines: phaseFightTimelines.data, phaseMitTimelines: phaseMitTimelines.data, logData: logData.data}} /> : ""}
              {fightInfo?.kill ? 
                <div key="wipe" className="collapse border border-base-300 bg-base-200">
                  <div className="collapse-title text-xl font-medium">
                  🎉🎉🎉 Kill @ {msToDuration(fightInfo.endTime - fightInfo.startTime)}
                  </div>
                </div> : null
              }
          </div>}
          {fightId && !fightInfo && <div className="skeleton h-360"></div>}
          {fightInfo && !(fightInfo.name === "The Omega Protocol") &&
            <div role="alert" className="alert">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Sorry, right now this tool only supports The Omega Protocol. We're hoping to add more fights soon!</span>
            </div>
          }
          {reportCode && !fightInfo &&
            <div role="alert" className="alert w-1/3">
              <svg className="w-[20px] h-[20px] text-gray-800 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
              </svg>
              <span>Select a fight in the dropdown to view mits.</span>
            </div>
          }
        </div>
      </main>
    </>
  );
}
