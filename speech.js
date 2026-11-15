/* Local speech only. Wait for delayed voice discovery without storing or sending text. */
(function(root){
  'use strict';
  function create({synth,Utterance,onStatus=()=>{},retryDelays=[150,450,900,1800],timeout=2500}){
    let serial=0, pendingCancel=null, message='';
    const report=(text)=>{message=text;onStatus(text);};
    const localVoice=()=>synth?.getVoices().find(v=>v.localService&&/^zh(?:-|_)/i.test(v.lang));
    function stop(){serial++;if(pendingCancel){const cancel=pendingCancel;pendingCancel=null;cancel();}synth?.cancel();if(message)report('朗读已停止，字幕仍可阅读。');}
    function waitForVoice(){
      const ready=localVoice();if(ready)return Promise.resolve(ready);
      report('正在准备本地中文语音，字幕可以先看。');
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
      if(!synth||!Utterance){report('当前环境不支持本地朗读，请使用字幕。');return false;}
      const voice=await waitForVoice();
      if(request!==serial)return false;
      if(!voice){report('当前环境没有可用的本地中文语音，请使用字幕。');return false;}
      const u=new Utterance(String(text));u.voice=voice;u.lang=voice.lang;u.rate=.87;
      u.onstart=()=>{if(request===serial)report('正在用本地中文语音朗读。');};
      u.onend=()=>{if(request===serial)report('朗读结束，可以再听一遍。');};
      u.onerror=()=>{if(request===serial)report('本次朗读未能播放，请使用字幕或再听一遍。');};
      report('本地中文语音已准备好。');synth.speak(u);return true;
    }
    // Trigger browser voice discovery before the first click, without reporting an empty list as failure.
    synth?.getVoices();
    return Object.freeze({speak,stop,status:()=>message});
  }
  root.FruitSpeech=Object.freeze({create});
})(typeof window!=='undefined'?window:globalThis);
