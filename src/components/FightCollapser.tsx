import { PhaseFightTimeline, PhaseInfo, PhaseMitTimeline } from "~/server/utils"
import PhaseMitigationTable from "./PhaseMitigationTable";

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

  return props.props.phaseInfo.map((phase, index) => { return(
    <div tabIndex={0} key={index} className="collapse collapse-arrow border border-base-300 bg-base-200">
      <input type="checkbox"/>
      <div className="collapse-title text-xl font-medium">
        P{phase.phaseNumber}: {phase.phaseName}
      </div>
      { getMitigationTable( props.props.phaseFightTimelines, props.props.phaseMitTimelines, props.props.logData, index )}
    </div>
  )})
}

export default FightCollapser