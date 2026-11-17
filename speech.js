/* Local speech only. Wait for delayed voice discovery without storing or sending text. */
(function(root){
  'use strict';
  function create({synth,Utterance,onStatus=()=>{},retryDelays=[150,450,900,1800],timeout=2500}){
    let serial=0, pendingCancel=null, message='';
    const report=(text)=>{message=text;onStatus(text);};
    const localVoice=()=>synth?.getVoices().find(v=>v.localService&&/^en(?:-|_)/i.test(v.lang));
    function stop(){serial++;if(pendingCancel){const cancel=pendingCancel;pendingCancel=null;cancel();}synth?.cancel();if(message)report('Reading stopped. You can still read the text.');}
    function waitForVoice(){
      const ready=localVoice();if(ready)return Promise.resolve(ready);
      report('Preparing a local English voice. You can read the text while you wait.');
      return new Promise(resolve=>{
        let done=false;const timers=[];
        const finish=(voice)=>{if(done)return;done=true;timers.forEach(clearTimeout);synth.removeEventListener?.('voiceschanged',check);pendingCancel=null;resolve(voice);};
        const check=()=>{const voice=localVoice();if(voice)finish(voice);};
        pendingCancel=()=>finish(null);
        synth.addEventListener?.('voiceschanged',check);
        retryDelays.forEach(ms=>timers.push(setTimeout(check,ms)));
        timers.push(setTimeout(()=>finish(localVoice()||null),timeout));
        check();
      });
    }
    async function speak(text){
      stop();const request=serial;
      if(!synth||!Utterance){report('Read-aloud is not supported here. Please read the on-screen text.');return false;}
      const voice=await waitForVoice();
      if(request!==serial)return false;
      if(!voice){report('No local English voice is available. Please read the on-screen text.');return false;}
      const u=new Utterance(String(text));u.voice=voice;u.lang=voice.lang;u.rate=.87;
      u.onstart=()=>{if(request===serial)report('Reading with a local English voice.');};
      u.onend=()=>{if(request===serial)report('Reading finished. You can listen again.');};
      u.onerror=()=>{if(request===serial)report('The audio could not play. Please read the text or try listening again.');};
      report('The local English voice is ready.');synth.speak(u);return true;
    }
    // Trigger browser voice discovery before the first click, without reporting an empty list as failure.
    synth?.getVoices();
    return Object.freeze({speak,stop,status:()=>message});
  }
  root.FruitSpeech=Object.freeze({create});
})(typeof window!=='undefined'?window:globalThis);
