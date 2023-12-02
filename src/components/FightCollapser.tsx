import { PhaseFightTimeline, PhaseInfo, PhaseMitTimeline } from "~/server/utils"
import PhaseMitigationTable from "./PhaseMitigationTable";
import { msToDuration } from "~/utils/log-utils";

export type FightCollapserProps = {props: {
  phaseInfo: PhaseInfo[],
  phaseFightTimelines: PhaseFightTimeline[],
  phaseMitTimelines: PhaseMitTimeline[],
  logData: any,
}}

const getMitigationTable = (phaseFightTimelines: PhaseFightTimeline[], phaseMitTimelines: PhaseMitTimeline[], logData: any, index: number) => { 
  if (!phaseFightTimelines[index]) return;
  return (
  <div className="collapse-content"> 
    <PhaseMitigationTable props={{phaseFightTimeline: phaseFightTimelines[index], phaseMitTimeline: phaseMitTimelines[index], logData: logData}} />
  </div>
)}

function FightCollapser(props: FightCollapserProps) {
  const fightInfo = props.props.logData.fightData.reportData.report.fights[0];

  const logDuration = fightInfo.endTime - fightInfo.startTime;

  return props.props.phaseInfo.map((phase, index) => { 
    if (phase.phaseNumber > fightInfo.lastPhase + 1) return null
    if (phase.phaseNumber === fightInfo.lastPhase + 1) return(
      <div key="wipe" className="collapse border border-base-300 bg-base-200">
        <div className="collapse-title text-xl font-medium">
        💀💀💀 Wipe @ {msToDuration(logDuration)} P{fightInfo.lastPhase} {fightInfo.bossPercentage}%
        </div>
      </div>
    );
    return(
      <div tabIndex={0} key={index} className="collapse collapse-arrow border border-base-300 bg-base-200">
        <input type="checkbox"/>
        <div className="collapse-title text-xl font-medium">
          P{phase.phaseNumber}: {phase.phaseName}
        </div>
        { getMitigationTable( props.props.phaseFightTimelines, props.props.phaseMitTimelines, props.props.logData, index )}
      </div>
    )});
}

export default FightCollapser