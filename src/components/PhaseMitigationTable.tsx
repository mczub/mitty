import { useState } from "react";
import { PhaseFightTimeline, PhaseMitTimeline } from "~/server/utils";
import { mergeFightTimelineWithLog, typeToJob, msToDuration, getPlayerDeaths, getPhaseStartTimestamps, getJobsInParty, getAbilityNameFromID } from "~/utils/log-utils";

export type PhaseMitigationTableProps = {props: {
  phaseFightTimeline: PhaseFightTimeline
  phaseMitTimeline: PhaseMitTimeline
  logData: any
}}

export default function PhaseMitigationTable(props: PhaseMitigationTableProps) {
  const [myMits] = useState(mergeFightTimelineWithLog(props.props.logData, props.props.phaseFightTimeline));
  const [jobsInParty] = useState(getJobsInParty(props.props.logData));

  const phaseFightTimeline = props?.props?.phaseFightTimeline;
  const phaseMitTimeline = props?.props?.phaseMitTimeline;
  const logData = props.props.logData;
  const logStartTime = logData.fightData.reportData.report.fights[0]?.startTime;
  const logEndTime = logData.fightData.reportData.report.fights[0]?.endTime;
  const deaths = getPlayerDeaths(logData);
  const phaseStartTime = myMits.phaseNumber === 1 ? logStartTime : getPhaseStartTimestamps(logData).find(startTimestamp => startTimestamp.phaseNumber === myMits.phaseNumber)?.timestamp ?? logStartTime;
  const phaseEndTime = getPhaseStartTimestamps(logData).find(startTimestamp => startTimestamp.phaseNumber === (myMits.phaseNumber + 1))?.timestamp ?? logEndTime;

  const getEventRows = (phaseFightTimeline: PhaseFightTimeline | undefined, phaseMitTimeline: PhaseMitTimeline | undefined, logData: any) => {
    if (!(phaseFightTimeline?.damageEvents)) return;

    return phaseFightTimeline.damageEvents.map((event, index, array) => {
      if (!(myMits.mitEvents[index]?.startTime)) return null;
      const mechStartTime = myMits.mitEvents[index]?.startTime - logStartTime;
      const mechEndTime =  myMits.mitEvents[index]?.endTime ? myMits.mitEvents[index]?.endTime - logStartTime : logEndTime - logStartTime;
      const deathsStartTime = mechStartTime;
      const deathsEndTime = (myMits.mitEvents[index + 1]?.startTime) ?  myMits.mitEvents[index + 1].startTime- logStartTime : phaseEndTime - logStartTime;
  
      return(
        <>
          <tr>
            <td>
              <p>{mechStartTime === mechEndTime ? msToDuration(mechStartTime) : `${msToDuration(mechStartTime)} - ${msToDuration(mechEndTime)}` }</p>
              {event.mechName}
            </td>
            { jobsInParty.map((job) => { 
              const expectedMits = filterExpectedMits(phaseMitTimeline?.expectedMitEvents[index]?.expectedMits, logData, job);
              const foundMits = myMits.mitEvents[index]?.mits?.filter(((mit: any) => mit.jobs.includes(job))).map((mit: any) => mit.name)
              return(
                <td>
                  { combineAndFormatMits(expectedMits, foundMits).map((mit: any) => (<p>{mit}</p>)) }
                </td>
              )
            })}
            <td>{!isNaN(myMits.mitEvents[index]?.percentage.min) ? <p className="text-lime-500 text-sm font-bold">{myMits.mitEvents[index]?.percentage?.min}% - {myMits.mitEvents[index]?.percentage?.max}%</p> : null}</td>
          </tr>
          {deaths.filter((death: any) => (deathsEndTime > death.timestamp - logStartTime) && (death.timestamp - logStartTime > deathsStartTime)).map((death: any) => {
            return getDeathRow(death.timestamp - logStartTime, death.player.name, death.player.job, getAbilityNameFromID(death.abilityId, logData))
          })}
        </>
      )
    })
  }

  const getDeathsBeforeFirstMech = (phaseFightTimeline: PhaseFightTimeline | undefined, phaseMitTimeline: PhaseMitTimeline | undefined, logData: any) => {
    const startTime = phaseStartTime - logStartTime;
    const endTime = myMits.mitEvents[0]?.startTime ? myMits.mitEvents[0]?.startTime - logStartTime : phaseEndTime - logStartTime;
    return deaths.filter((death: any) => (endTime > death.timestamp - logStartTime) && (death.timestamp - logStartTime > startTime)).map((death: any) => {
      return getDeathRow(death.timestamp - logStartTime, death.player.name, death.player.job, getAbilityNameFromID(death.abilityId, logData))
    })
  }

  const getDeathRow = (fightRelativeTimestamp: number, playerName: string, playerJob: string, mechanic?: string) => {
    return (
      <tr className="bg-base-100">
        <td>{msToDuration(fightRelativeTimestamp)}</td>
        <td colSpan={9}>💀 {playerName} ({playerJob}) died {mechanic && (<span>to {mechanic}</span>)}</td>
      </tr>
    )
  }

  return(
    <table className="table w-full table-fixed">
      <thead>
        <tr>
          <th>Mechanic</th>
          { jobsInParty.map((job) => (<th>{job}</th>))}
          <th>Mit %</th>
        </tr>
      </thead>
      <tbody>
        { getDeathsBeforeFirstMech(phaseFightTimeline, phaseMitTimeline, logData) }
        { getEventRows(phaseFightTimeline, phaseMitTimeline, logData) }
      </tbody>
    </table>
  )
}

const filterExpectedMits = (expectedMits: any, logData: any, job?: string) => {
  const logPlayerDetails = logData.fightData.reportData.report.playerDetails?.data?.playerDetails;
  if (!logPlayerDetails) return expectedMits.map((mit: any) => mit.name);
  if (job) {
    return expectedMits.filter((mit: any) => mit?.jobs?.includes(job)).map((mit: any) => mit.name);
  }
  const jobsInParty = Object.values(logPlayerDetails).flat().map((player: any) => typeToJob.get(player.type));
  return expectedMits.filter((mit: any) => mit?.jobs.some((job: any) => jobsInParty.includes(job))).map((mit: any) => mit.name);
}

const combineAndFormatMits = (expectedMits: any, foundMits: any): string[] => {
  const combinedMits: string[] = [];
  expectedMits.map((expected: string) => {
    combinedMits.push(`${foundMits.includes(expected) ? '✅' : '⛔'} ${expected}`);
  });
  foundMits.map((found: string) => {
    if (!expectedMits.includes(found)){
      combinedMits.push(`⏫ ${found}`)
    }
  })
  return combinedMits;
}