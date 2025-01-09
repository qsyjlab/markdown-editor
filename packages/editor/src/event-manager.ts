import mitt from "mitt";

type EmitterEvents = {
    "editor:change": {
        text:string
    }

};

export class EventManager {
  private instance = mitt<EmitterEvents>();
  constructor() {
    this.instance.on('editor:change', (data)=> {})
    // this.instance = mitt<EdtiorEvents>()
    // this.on =
  }

  on(event: keyof EmitterEvents, callback: (data: any) => void) {
    // this.instance.on(event, callback)
  }
}
