import { PhaseFightTimeline, PhaseMitTimeline } from "~/server/utils";
import { mergeFightTimelineWithLog, typeToJob } from "~/utils/log-utils";

export type PhaseMitigationTableProps = {props: {
  phaseFightTimeline?: PhaseFightTimeline
  phaseMitTimeline?: PhaseMitTimeline
  logData: any
}}

const getEventRow = (phaseTimeline: PhaseFightTimeline, phaseMitTimeline: PhaseMitTimeline, logData: any) => {
  if (!phaseTimeline?.damageEvents) return;
  
  return phaseTimeline.damageEvents.map((event, index) => {
    const myMits = mergeFightTimelineWithLog(logData, phaseTimeline);
    return(
      <tr>
        <td>{event.mechName}</td>
        <td>{myMits.mitEvents[index]?.mits?.map((mit: any) => mit.name).join(", ")} 
          <p className="text-lime-500 text-sm font-bold">({myMits.mitEvents[index]?.percentage?.min}% - {myMits.mitEvents[index]?.percentage?.max}%)</p>
        </td>
        <td>{filterExpectedMits(phaseMitTimeline.expectedMitEvents[index].expectedMits, logData)}</td>
      </tr>
    )
  })
}

export default function PhaseMitigationTable(props: PhaseMitigationTableProps) {
  return(
    <table className="table">
      <thead>
        <tr>
          <th>Mechanic</th>
          <th>Your Mits</th>
          <th>Expected Mits</th>
        </tr>
      </thead>
      <tbody>
        { props?.props?.phaseFightTimeline && props?.props?.phaseMitTimeline && getEventRow(props.props.phaseFightTimeline, props.props.phaseMitTimeline, props.props.logData) }
      </tbody>
    </table>
  )
}

const filterExpectedMits = (expectedMits: any, logData: any) => {
  const logPlayerDetails = logData.fightData.reportData.report.playerDetails?.data?.playerDetails;
  if (!logPlayerDetails) return expectedMits.map((mit: any) => mit.name).join(', ');
  const jobsInParty = Object.values(logPlayerDetails).flat().map((player: any) => typeToJob.get(player.type));
  return expectedMits.filter((mit: any) => mit?.jobs.some((job: any) => jobsInParty.includes(job))).map((mit: any) => mit.name).join(', ');
}