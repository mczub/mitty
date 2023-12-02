import { useState } from "react";
import { PhaseFightTimeline, PhaseMitTimeline } from "~/server/utils";
import { mergeFightTimelineWithLog, typeToJob, msToDuration } from "~/utils/log-utils";

export type PhaseMitigationTableProps = {props: {
  phaseFightTimeline?: PhaseFightTimeline
  phaseMitTimeline?: PhaseMitTimeline
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

  const getEventRows = (phaseFightTimeline: PhaseFightTimeline | undefined, phaseMitTimeline: PhaseMitTimeline | undefined, logData: any) => {
    if (!(phaseFightTimeline?.damageEvents)) return;

    return phaseFightTimeline.damageEvents.map((event, index) => {
      if (!(myMits.mitEvents[index]?.mits?.length)) return null;
      const mechStartTime = myMits.mitEvents[index]?.startTime - logStartTime;
      const mechEndTime = myMits.mitEvents[index]?.endTime - logStartTime;
  
      return(
        <tr>
          <td>
            <p>{mechStartTime === mechEndTime ? msToDuration(mechStartTime) : `${msToDuration(mechStartTime)} - ${msToDuration(mechEndTime)}` }</p>
            {event.mechName}
          </td>
          { jobsInParty.map((job) => { 
            const expectedMits = filterExpectedMits(phaseMitTimeline?.expectedMitEvents[index].expectedMits, logData, job);
            const foundMits = myMits.mitEvents[index]?.mits?.filter(((mit: any) => mit.jobs.includes(job))).map((mit: any) => mit.name)
            return(
              <td>
                { combineAndFormatMits(expectedMits, foundMits).map((mit: any) => (<p>{mit}</p>)) }
              </td>
            )
          })}
          <td><p className="text-lime-500 text-sm font-bold">{myMits.mitEvents[index]?.percentage?.min}% - {myMits.mitEvents[index]?.percentage?.max}%</p></td>
        </tr>
      )
    })
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

const getJobsInParty = (logData: any) => {
  const logPlayerDetails = logData.fightData.reportData.report.playerDetails?.data?.playerDetails;
  const jobsInParty = Object.values(logPlayerDetails).flat().map((player: any) => typeToJob.get(player.type));
  const sortArray = Array.from(typeToJob.values());
  return jobsInParty.sort((a: any, b: any) => sortArray.indexOf(a) > sortArray.indexOf(b) ? 1 : -1)
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