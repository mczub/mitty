export type FflogsParams = {
  isValid: boolean;
  errorMessage?: string | undefined | null;
  reportCode?: string | undefined | null;
  fightId?: number | undefined | null;
  isLastFight?: boolean | undefined | null;
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