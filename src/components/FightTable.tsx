import { PhaseFightTimeline, PhaseInfo, PhaseMitTimeline } from "~/server/utils"
import PhaseMitigationTable from "./PhaseMitigationTable";
import { getAbilityNameFromID, getFightTimelineFromLog, getJobsInParty, getMitPercentagesFromDamageEvents, getMitsFromDamageEvents, getPlayerDeaths, getPxFromPhase, msToDuration } from "~/utils/log-utils";
import { useState } from "react";

export type FightTableProps = {props: {
  logData: any,
}}


function FightTable(props: FightTableProps) {
  const [jobsInParty] = useState(getJobsInParty(props.props.logData));

  const logData = props.props.logData;
  const fightInfo = logData.fightData.reportData.report.fights[0];
  const deaths = getPlayerDeaths(logData);
  const fightTimeline = getFightTimelineFromLog(logData);

  const getEventRows = () => {
    return fightTimeline?.mechanics?.map((mechanic: any, index: number) => {
      const deathsStartTime = mechanic.startTime - fightTimeline.startTime;
      const deathsEndTime = (fightTimeline.mechanics[index + 1]?.startTime) ? fightTimeline.mechanics[index + 1]!.startTime - fightTimeline.startTime : fightTimeline.endTime - fightTimeline.startTime;
      const percentages = getMitPercentagesFromDamageEvents(mechanic.damageEvents);
      return (
        <>
        <tr>
          <td>
            <p>{ msToDuration(mechanic.startTime - fightTimeline.startTime) } - { msToDuration(mechanic.endTime - fightTimeline.startTime) }</p>
            {mechanic.name}
          </td>
          { jobsInParty.map((job) => { 
            const foundMits = getMitsFromDamageEvents(mechanic.damageEvents);
            return (
              <td> 
                {foundMits.filter(((mit: any) => mit.jobs.includes(job))).map((mit: any) => {
                  return (<p>☑️ {mit.name}</p>);
                })}
              </td>
            )
          })}
          <td>
          {!isNaN(percentages.min) ?  <p className="text-lime-500 text-sm font-bold">{percentages.min}% - {percentages.max}%</p> : null}
          </td>
        </tr>
        {deaths.filter((death: any) => (deathsEndTime > death.timestamp - fightTimeline.startTime) && (death.timestamp - fightTimeline.startTime > deathsStartTime)).map((death: any) => {
          return getDeathRow(death.timestamp - fightTimeline.startTime, death.player.name, death.player.job, getAbilityNameFromID(death.abilityId, logData))
        })}
        </>
      )
    })
  }

  const getDeathsBeforeFirstMech = () => {
    const endTime = fightTimeline!.mechanics[0]?.startTime ? fightTimeline!.mechanics[0]?.startTime - fightTimeline!.startTime : 0;
    return deaths.filter((death: any) => (endTime > death.timestamp - fightTimeline!.startTime)).map((death: any) => {
      return getDeathRow(death.timestamp - fightTimeline!.startTime, death.player.name, death.player.job, getAbilityNameFromID(death.abilityId, logData))
    });
  }

  const getDeathRow = (fightRelativeTimestamp: number, playerName: string, playerJob: string, mechanic?: string) => {
    return (
      <tr className="bg-base-100">
        <td>{msToDuration(fightRelativeTimestamp)}</td>
        <td colSpan={9}>💀 {playerName} ({playerJob}) died {mechanic && (<span>to {mechanic}</span>)}</td>
      </tr>
    )
  }

  const getWipeRow = () => {
    return (<div key="wipe" className="collapse border border-base-300 bg-base-200">
      <div className="collapse-title text-xl font-medium">
      💀💀💀 Wipe @ {msToDuration(fightTimeline!.endTime - fightTimeline!.startTime)} {getPxFromPhase(fightInfo.lastPhase) + ' '}{fightInfo.bossPercentage}%
      </div>
    </div>)
  }

  const getKillRow = () => {
    return (<div key="kill" className="collapse border border-base-300 bg-base-200">
    <div className="collapse-title text-xl font-medium">
    🎉🎉🎉 Kill @ {msToDuration(fightTimeline!.endTime - fightTimeline!.startTime)}
    </div>
  </div>)
  }

  return (fightTimeline && <>
    {fightInfo && (<div className="p-[1rem] navbar">#{ fightInfo.id } { fightInfo.name }</div>)}
    <div role="alert" className="alert">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>This fight isn't fully supported, but we're making our best guess as to the timeline.</span>
    </div>
    <table className="table w-full table-fixed">
      <thead>
        <tr>
          <th>Mechanic</th>
          { jobsInParty.map((job) => (<th>{job}</th>))}
          <th>Mit %</th>
        </tr>
      </thead>
      <tbody>
        { fightTimeline && getDeathsBeforeFirstMech() }
        { fightTimeline && getEventRows() }
      </tbody>
    </table>
    { fightTimeline && !fightInfo.kill && getWipeRow() }
    { fightTimeline && fightInfo.kill && getKillRow() }
  </>)
}

export default FightTable