

interface InsertCallbackParams {
    selectedText: string 

    start: number 
    
    end:number
}

export type InsertCallback = (
    params: InsertCallbackParams
) => InsertCallbackResult;

export interface InsertCallbackResult {
  start: number;
  end: number;
  formattedText: string;
}
