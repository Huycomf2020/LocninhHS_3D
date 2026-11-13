import chatter from './assets/cafe-chatter.wav';
import chess from './assets/cafe-chess.wav';
import { cafePoint } from './campus';

export function createCampusAudio(){
  let context, master, noise, stepDistance=0, lastCall=0, enabled=false;
  const voices=[new Audio(chatter),new Audio(chess)];
  voices[0].loop=true;
  function effect(strength,frequency,duration){
    if(context?.state!=='running')return;
    const time=context.currentTime;
    const source=context.createBufferSource(), filter=context.createBiquadFilter(), volume=context.createGain();
    source.buffer=noise;filter.type='lowpass';filter.frequency.value=frequency;
    volume.gain.setValueAtTime(strength,time);
    volume.gain.exponentialRampToValueAtTime(.0001,time+duration);
    source.connect(filter).connect(volume).connect(master);
    source.start(time,Math.random()*.5,duration);
  }
  const table=cafePoint(.25,2.95);
  return {
    unlock(){
      if(!context){
        const AudioContext=window.AudioContext||window.webkitAudioContext;
        if(!AudioContext)return;
        context=new AudioContext();master=context.createGain();master.gain.value=enabled?1:0;master.connect(context.destination);
        noise=context.createBuffer(1,context.sampleRate,context.sampleRate);
        const data=noise.getChannelData(0);
        for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
      }
      if(context.state==='suspended')context.resume().catch(()=>{});
    },
    mute(value){
      enabled=!value;
      if(master)master.gain.value=enabled?1:0;
      if(value)voices.forEach(voice=>voice.pause());
    },
    update(x,z,distance){
      if(!enabled||context?.state!=='running')return;
      stepDistance+=distance;
      if(stepDistance>.96){stepDistance=0;effect(.23,430+Math.random()*360,.12);}
      const proximity=Math.max(0,Math.min(1,(9-Math.hypot(x-table.x,z-table.z))/6));
      if(proximity<.03){voices.forEach(voice=>voice.pause());return;}
      voices[0].volume=proximity*.24;
      voices[1].volume=proximity*.75;
      if(voices[0].paused)voices[0].play().catch(()=>{});
      const now=context.currentTime;
      if(proximity>.32&&(lastCall===0||now-lastCall>20)){
        lastCall=now;effect(proximity*.29,1900,.065);
        voices[1].currentTime=0;voices[1].play().catch(()=>{});
      }
    },
    dispose(){voices.forEach(voice=>voice.pause());context?.close();}
  };
}
