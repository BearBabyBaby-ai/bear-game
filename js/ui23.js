// 裝備欄單純呈現：平常只顯示部位、名稱、評分；點一下裝備才展開詳細屬性與強化等按鈕。
const openSlots23=new Set();
const renderEquipmentSlots23u=renderEquipmentSlots;
renderEquipmentSlots=function(){renderEquipmentSlots23u.apply(this,arguments);const grid=document.getElementById('equipment-slots-grid');if(!grid)return;
 const keys=Object.keys(EQUIPMENT_SLOTS);[...grid.children].forEach((card,idx)=>{if(card.dataset.simple23)return;card.dataset.simple23='1';const slot=keys[idx];
  const extra=[...card.children].filter(n=>n.tagName==='SMALL'||n.tagName==='BUTTON');if(!extra.length){card.classList.add('empty23');return;}
  const detail=document.createElement('div');detail.className='slot-detail23';const acts=document.createElement('div');acts.className='slot-actions23';
  for(const n of extra){if(n.tagName==='BUTTON'){n.addEventListener('click',e=>e.stopPropagation());acts.append(n);}else detail.append(n);}detail.append(acts);
  const hint=document.createElement('div');hint.className='slot-hint23';hint.textContent='點一下查看與強化';
  const score=card.querySelector('.gear-score');if(score)card.append(score);card.append(hint,detail);
  card.classList.add('simple23');if(openSlots23.has(slot))card.classList.add('open23');
  card.addEventListener('click',()=>{const open=!card.classList.contains('open23');card.classList.toggle('open23',open);if(open)openSlots23.add(slot);else openSlots23.delete(slot);hint.textContent=open?'點一下收合':'點一下查看與強化';});
  if(openSlots23.has(slot))hint.textContent='點一下收合';});};
