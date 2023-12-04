export const mergeFightTimelineWithLog = (logData: any, fightTimeline: any) => {
  const loggedMitTimeline = {
    phaseNumber: fightTimeline.phaseNumber,
    mitEvents: [] as any[],
  }
  const logEventsData = logData.fightData.reportData.report.events.data;

  loggedMitTimeline.mitEvents.push(...fightTimeline.damageEvents.map((damageEvent: any) => {
    const startAbilityIndex = damageEvent.abilityIndex[0];
    const endAbilityIndex = damageEvent.abilityIndex[damageEvent.abilityIndex.length - 1];

    const startTime = logEventsData.filter((logEvent: any) => logEvent.abilityGameID === damageEvent.abilityId)[startAbilityIndex]?.timestamp;
    const endTime = logEventsData.filter((logEvent: any) => logEvent.abilityGameID === damageEvent.abilityId)[endAbilityIndex]?.timestamp;
    return {
      mechId: damageEvent.mechId,
      mechName: damageEvent.mechName,
      startTime: startTime,
      endTime: endTime,
      mits: buffIdsToNames(getBuffIdsFromDamageEvent(logData, damageEvent)),
      percentage: getMitPercentageFromDamageEvent(logData, damageEvent)
    }
  }))

  return loggedMitTimeline;
}

const getMitPercentageFromDamageEvent = (logData: any, damageEvent: any): any => {
  const logEventsData = logData.fightData.reportData.report.events.data;
  const multipliers = damageEvent.abilityIndex.map((aIndex: number, index: number) => {
    return (logEventsData.filter((logEvent: any) => logEvent.abilityGameID === damageEvent.abilityId)[aIndex]?.multiplier)
  });
  return { min: Math.round((1 - Math.max(...multipliers)) * 100), max: Math.round((1 - Math.min(...multipliers)) * 100) }
}

const getBuffIdsFromDamageEvent = (logData: any, damageEvent: any): number[] => {
  const logEventsData = logData.fightData.reportData.report.events.data;

  const buffsToMerge: number[][] = damageEvent.abilityIndex.map((aIndex: number, index: number) => {
    return (logEventsData.filter((logEvent: any) => logEvent.abilityGameID === damageEvent.abilityId)[aIndex]?.buffs)?.split('.')
  });

  return [...new Set([...buffsToMerge.flat()])];
}

export const buffIdsToNames = (buffIds: number[]) => {
  return buffIds.sort().filter(buff => !!mapIdToAbility(buff)).map(buff => {
    return mapIdToAbility(buff);
  });
}

const mapIdToAbility = (buffId: number): Mitigation | undefined => {
  return allMits.find((mit) => mit.abilityId == buffId);
}

export const msToDuration = (milliseconds: any): string => {
  const min = Math.floor(parseInt(milliseconds) / 60000);
  const sec = Math.floor((parseInt(milliseconds) % 60000) / 1000);

  return sec === 60 ? 
    `${min + 1}:00` :
    `${min}:${sec.toString().padStart(2, '0')}`
}

export const getPlayerDeaths = (logData: any) => {
  const deathEventsData = logData.fightData.reportData.report.deaths.data;
  const playerData: any = Object.values(logData.fightData.reportData.report.playerDetails.data.playerDetails).flat();

  return deathEventsData.map((deathEvent: any) => {
    const player = playerData.find((player: any) => player.id === deathEvent.targetID);
    if (!player) return;
    return {
      timestamp: deathEvent.timestamp,
      abilityId: deathEvent.killingAbilityGameID,
      player: {
        ...player,
        job: typeToJob.get(player.type)
      }
    }
  })
}

export const getPhaseStartTimestamps = (logData: any) => {
  const targetabilityUpdates = logData.fightData.reportData.report.targetabilityUpdates?.data;
  const fightStartTime = logData.fightData.reportData.report.fights[0].startTime;
  const phaseStarts = [
    {
      phaseNumber: 1,
      timestamp: 0,
    }
  ]
  Object.keys(phaseStartTargetabilityIndex).forEach((phase) => {
    const phaseNumber = parseInt(phase);
    const targetabilityIndex = (phaseStartTargetabilityIndex as any)[phaseNumber]
    if (targetabilityUpdates[targetabilityIndex]) {
      phaseStarts.push({
        phaseNumber: phaseNumber,
        timestamp: targetabilityUpdates[targetabilityIndex].timestamp - fightStartTime
      })
    }
  });
  return phaseStarts;
}

export type FightMitTimeline = {
  startTime: number;
  endTime: number;
  mechanics: FightMechanic[];
}

export type FightMechanic = {
  abilityIDs: number[];
  mechID: string;
  name: string;
  startTime: number;
  endTime: number;
  damageEvents: CalculatedDamageEvent[];
}

export type CalculatedDamageEvent = {
  abilityGameID: number;
  buffs: string;
  unmitigatedAmount: number;
  amount: number;
  sourceID: number;
  targetID: number;
  timestamp: number;
  multiplier: number;
}

export type Mitigation = {
  name: string;
  abilityId: number;
  jobs: string[];
}

export const getJobsInParty = (logData: any) => {
  const logPlayerDetails = logData.fightData.reportData.report.playerDetails?.data?.playerDetails;
  const jobsInParty = Object.values(logPlayerDetails).flat().map((player: any) => typeToJob.get(player.type));
  const sortArray = Array.from(typeToJob.values());
  return jobsInParty.sort((a: any, b: any) => sortArray.indexOf(a) > sortArray.indexOf(b) ? 1 : -1)
}

export const getMitsFromDamageEvents = (damageEvents: CalculatedDamageEvent[]): Mitigation[] => {
  const buffsToMerge = damageEvents.map((event: CalculatedDamageEvent) => event.buffs).join().split('.');
  const buffIds = [...new Set([...buffsToMerge.flat()])];
  return buffIds.filter((id: string) => mapIdToAbility(parseInt(id))).map((id: string) => mapIdToAbility(parseInt(id))!)
}

export const getMitPercentagesFromDamageEvents = (damageEvents: CalculatedDamageEvent[]): any => {
  const multipliers = damageEvents.map((event: CalculatedDamageEvent) => event.multiplier);
  
  return { min: Math.round((1 - Math.max(...multipliers)) * 100), max: Math.round((1 - Math.min(...multipliers)) * 100) }
}

export const getFightTimelineFromLog = (logData: any) => {
  const enemyCasts = logData.fightData.reportData.report.enemyCastEvents?.data;
  const events = logData.fightData.reportData.report.events?.data;
  const masterData = logData.fightData.reportData.report.masterData;
  const fightStartTime = logData.fightData.reportData.report.fights[0].startTime;
  const fightEndTime = logData.fightData.reportData.report.fights[0].endTime;

  const autoIDs = masterData.abilities.filter((ability: any) => ability.name === "attack").map((ability: any) => ability.gameID);
  const eventsNoAutos = events.filter((event: any) => (!autoIDs.includes(event.abilityGameID)) && (event.abilityGameID !== 16152));

  const fightTimeline: FightMitTimeline = {
    startTime: fightStartTime,
    endTime: fightEndTime,
    mechanics: []
  }

  const allMechs: FightMechanic[] = [];
  let eventsCursor = 0;
  
  const filteredEnemyCasts = enemyCasts.filter((cast: any) => {
    return !cast.sourceInstance
  });

  const reducedCasts: any[] = [filteredEnemyCasts[0]!];

  filteredEnemyCasts.forEach((cast: any, index: number) => {
    if (index === 0) return;
    const currentRealCast = reducedCasts.pop()!;
    if (cast.timestamp < filteredEnemyCasts[index - 1].timestamp + 5000){
      reducedCasts.push(currentRealCast);
    } else {
      reducedCasts.push(currentRealCast);
      reducedCasts.push(cast);
    }
  });

  reducedCasts.forEach((cast: any, index: number) => {
    const slicedEvents = eventsNoAutos.slice(eventsCursor, eventsNoAutos.length - 1);
    const nextCastEventIndex = slicedEvents.findIndex((event: CalculatedDamageEvent) => reducedCasts[index + 1] ? event.timestamp >= reducedCasts[index + 1].timestamp : false)
    const castAbilityName = masterData.abilities.find((ability: any) => ability.gameID === cast.abilityGameID).name;
    const mechanic: FightMechanic = {
      mechID: castAbilityName.toLowerCase() + '-' + index.toString(),
      abilityIDs: [cast.abilityGameID],
      name: castAbilityName,
      startTime: cast.timestamp,
      endTime: cast.timestamp,
      damageEvents: eventsNoAutos.slice(eventsCursor, nextCastEventIndex + eventsCursor),
      
    }
    eventsCursor = eventsCursor + nextCastEventIndex;
    if (mechanic.damageEvents.length === 0) return;
    mechanic.endTime = mechanic.damageEvents[mechanic.damageEvents.length - 1]?.timestamp ?? mechanic.startTime;
    allMechs.push(mechanic);
  });

  if (allMechs.length === 0) return;

  fightTimeline.mechanics = allMechs;
  
  return fightTimeline;
}

export const getAbilityNameFromID = (abilityId: number, logData: any) => {
  const masterData = logData?.fightData?.reportData?.report?.masterData;
  return masterData?.abilities?.find((ability: any) => ability.gameID === abilityId)?.name ?? '';
} 

export const getPxFromPhase = (phase: number) => {
  if (phase === 0) return '';
  return `P${phase}`;
}

export const getPercentage = (percentage: number | string) => {
  if (!percentage) return '--';
  if (percentage === 0) return '--';
  return `${percentage}%`
}

const phaseStartTargetabilityIndex = {
  2: 1,
  3: 9,
  4: 11,
  5: 13,
  6: 21
}

const allMits: Mitigation[] = [
  { name: "Shake It Off", abilityId: 1001457, jobs: ['WAR'] },
  { name: "Divine Veil", abilityId: 1001362, jobs: ['PLD'] },
  { name: "Passage of Arms", abilityId: 1001176, jobs: ['PLD']},
  { name: "Heart of Light", abilityId: 1001839, jobs: ['GNB'] },
  { name: "Dark Missionary", abilityId: 1001894, jobs: ['DRK'] },
  { name: "Reprisal", abilityId: 1001193, jobs: ['WAR', 'PLD', 'GNB', 'DRK'] },
  { name: "Seraphic Illumination", abilityId: 1001193, jobs: ['SCH'] },
  { name: "Galvanize", abilityId: 1000297, jobs: ['SCH'] },
  { name: "Sacred Soil", abilityId: 1000299, jobs: ['SCH'] },
  { name: "Expedience", abilityId: 1002711, jobs: ['SCH'] },
  { name: "Fey Illumination", abilityId: 1000317, jobs: ['SCH']},
  { name: "Eukrasian Prognosis", abilityId: 1002609, jobs: ['SGE']},
  { name: "Kerachole", abilityId: 1002618, jobs: ['SGE']},
  { name: "Panhaima", abilityId: 1002613, jobs: ['SGE']},
  { name: "Holos", abilityId: 1003003, jobs: ['SGE']},
  { name: "Temperance", abilityId: 1001873, jobs: ['WHM']},
  { name: "Collective Unconscious", abilityId: 1000849, jobs: ['AST']},
  { name: "Neutral Sect", abilityId: 1001892, jobs: ['AST']},
  { name: "Feint", abilityId: 1001195, jobs: ['MNK', 'NIN', 'RPR', 'DRG', 'SAM']},
  { name: "Tactician", abilityId: 1001951, jobs: ['MCH']},
  { name: "Troubadour", abilityId: 1001934, jobs: ['BRD']},
  { name: "Shield Samba", abilityId: 1001826, jobs: ['DNC']},
  { name: "Addle", abilityId: 1001203, jobs: ['RDM', 'SMN', 'BLM']},
  { name: "Dismantle", abilityId: 1000860, jobs: ['MCH']},
  { name: "Magick Barrier", abilityId: 1002707, jobs: ['RDM']},
  { name: "Land Waker", abilityId: 1000863, jobs: ['WAR']},
  { name: "Last Bastion", abilityId: 1000186, jobs: ['PLD']},
  { name: "Gunmetal Soul", abilityId: 1001931, jobs: ['GNB']},
  { name: "Dark Force", abilityId: 1000864, jobs: ['DRK']},
]

export const typeToJob: Map<string, string> = new Map<string,string>([
  ['Warrior', 'WAR'],
  ['Paladin', 'PLD'],
  ['Gunbreaker', 'GNB'],
  ['DarkKnight', 'DRK'],
  ['Scholar', 'SCH'],
  ['WhiteMage', 'WHM'],
  ['Astrologian', 'AST'],
  ['Sage', 'SGE'],
  ['Monk', 'MNK'],
  ['Ninja', 'NIN'],
  ['Reaper', 'RPR'],
  ['Dragoon', 'DRG'],
  ['Samurai', 'SAM'],
  ['RedMage', 'RDM'],
  ['Summoner', 'SMN'],
  ['BlackMage', 'BLM'],
  ['Machinist', 'MCH'],
  ['Bard', 'BRD'],
  ['Dancer', 'DNC'],
]);