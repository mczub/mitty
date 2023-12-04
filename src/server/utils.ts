export type FflogsParams = {
  isValid: boolean;
  errorMessage?: string | undefined | null;
  reportCode?: string | undefined | null;
  fightId?: number | undefined | null;
  isLastFight?: boolean | undefined | null;
} 

export type PhaseInfo = {
  phaseName: string;
  phaseNumber: number;
}

export type PhaseFightTimeline = {
  phaseNumber: number;
  damageEvents: PhaseFightDamageEvents[];
}

export type PhaseFightDamageEvents = {
  mechId: string;
  mechName: string;
  abilityId: number;
  abilityName: string;
  abilityIndex: number[];
}

export type PhaseMitTimeline = {
  phaseNumber: number;
  expectedMitEvents: MitEvent[];
}

export type MitEvent = {
  mechId: string;
  mechName: string;
  expectedMits: Mitigation[];
}

export type Mitigation = {
  name: string;
  abilityId: number;
  jobs: string[];
}

const urlRegex =  /^(?:.*(?:fflogs\.com|ffxivlogs\.cn)\/reports\/)?(?<code>(?:a:)?[a-zA-Z0-9]{16})\/?(?:#(?=(?:.*fight=(?<fight>[^&]*))?)(?=(?:.*source=(?<source>[^&]*))?).*)?$/;

export const getParamsFromUrl = (urlString: string) : FflogsParams => {
  try {
    const fflogsMatch = urlRegex.exec(urlString);
    if (fflogsMatch === null) {
      throw new SyntaxError("Not a valid FFLogs URL"); 
    }
    const params: FflogsParams = {
      isValid: true,
      reportCode: fflogsMatch.groups?.code,
    }
    if (fflogsMatch.groups?.fight) {
      if (fflogsMatch.groups?.fight === 'last') {
        params.isLastFight = true;
      } else {
        params.fightId = parseInt(fflogsMatch.groups?.fight)
      }
    }
    return params;
  } catch (err: any) {
    return {
      isValid: false,
      errorMessage: err.message.toString(),
    }
  } 
}


export const rangeToArray = (start: number, end: number): number[]  => {
  return [...Array(end - start + 1).keys()].map(x => x + start);
}