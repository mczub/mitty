export const mergeFightTimelineWithLog = (logData: any, fightTimeline: any) => {
  let loggedMitTimeline = {
    phaseNumber: fightTimeline.phaseNumber,
    mitEvents: [] as any[],
  }

  loggedMitTimeline.mitEvents.push(...fightTimeline.damageEvents.map((damageEvent: any) => {
    return {
      mechId: damageEvent.mechId,
      mechName: damageEvent.mechName,
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
    return (logEventsData.filter((logEvent: any) => logEvent.abilityGameID === damageEvent.abilityId)[aIndex]?.buffs).split('.')
  });

  return [...new Set([...buffsToMerge.flat()])];
}

export const buffIdsToNames = (buffIds: number[]) => {
  return buffIds.sort().filter(buff => !!mapIdToAbility(buff)).map(buff => {
    return mapIdToAbility(buff);
  });
}

const mapIdToAbility = (buffId: number) => {
  return allMits.find((mit) => mit.abilityId == buffId);
}

const allMits = [
  { name: "Shake It Off", abilityId: 1001457, jobs: ['WAR'] },
  { name: "Divine Veil", abilityId: 1001362, jobs: ['PLD'] },
  { name: "Passage of Arms", abilityId: 1001176, jobs: ['PLD']},
  { name: "Heart of Light", abilityId: 1001839, jobs: ['GNB'] },
  { name: "Dark Missionary", abilityId: 1001894, jobs: ['DRK'] },
  { name: "Reprisal", abilityId: 1001193, jobs: ['WAR', 'PLD', 'GNB', 'DRK'] },
  { name: "Seraphic Illumination", abilityId: 1001193, jobs: ['SCH'] },
  { name: "Spreadlo/Galvanize", abilityId: 1000297, jobs: ['SCH'] },
  { name: "Sacred Soil", abilityId: 1000299, jobs: ['SCH'] },
  { name: "Expedience", abilityId: 1002711, jobs: ['SCH'] },
  { name: "Fey Illumination", abilityId: 1000317, jobs: ['SCH']},
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
]

export const typeToJob: Map<string, string> = new Map([
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
  ['Machinist', 'MCH'],
  ['Bard', 'BRD'],
  ['Dancer', 'DNC'],
  ['RedMage', 'RDM'],
  ['Summoner', 'SMN'],
  ['BlackMage', 'BLM'],
]);