import {storageLoad} from './data.js';

const labels={
  en:{back:'Back a page',forward:'Forward a page',switchRole:'Switch role'},
  he:{back:'חזרה לעמוד הקודם',forward:'מעבר לעמוד הבא',switchRole:'החלפת תפקיד'},
  ar:{back:'الصفحة السابقة',forward:'الصفحة التالية',switchRole:'تغيير الدور'}
};
const sessionValue=key=>sessionStorage.getItem('ss-'+key)||'';
const initialState=history.state?.schoolSignal?history.state:{schoolSignal:true,index:0,canForward:false,role:sessionValue('role'),person:sessionValue('person'),child:sessionValue('child'),screen:sessionValue('screen')||'welcome'};
history.replaceState(initialState,'',location.href);

function saveSession(state){
  for(const key of ['role','person','child','screen','currentClass','editing','editLesson']){
    if(state[key])sessionStorage.setItem('ss-'+key,state[key]);
    else sessionStorage.removeItem('ss-'+key);
  }
}

function nextState(action){
  const state={...history.state,canForward:false};
  if(action==='switch'){
    Object.assign(state,{role:'',person:'',child:'',screen:'choose',editing:'',editLesson:''});
  }else if(action==='start'){
    const selected=document.getElementById('person-select');
    if(selected)state.person=selected.value;
    const data=storageLoad();
    state.child=state.role==='parent'?data.parents.find(parent=>parent.id===state.person)?.studentIds[0]||'':'';
    state.screen='home';
  }else if(action.startsWith('selectRole:')){
    state.role=action.split(':')[1];
    const data=storageLoad();
    const people=state.role==='student'?data.students:state.role==='parent'?data.parents:data.teachers;
    state.person=people[0]?.id||'';
    state.child='';
    state.editing='';
    state.editLesson='';
    state.screen='onboarding';
  }else if(action.startsWith('go:')){
    const requested=action.slice(3);
    state.screen=requested==='homework'&&state.role==='teacher'?'manage':requested;
    if(requested==='create')state.editing='';
  }else if(action.startsWith('child:')){
    const [,id,target='childDetail']=action.split(':');
    state.child=id;
    state.screen=target;
  }else if(action.startsWith('class:')){
    state.currentClass=action.split(':')[1];
    state.screen='classDetail';
  }else if(action.startsWith('edit:')){
    state.editing=action.split(':')[1];
    state.screen='edit';
  }else if(action.startsWith('lessonEdit:')){
    const lesson=storageLoad().lessons.find(item=>item.id===action.split(':')[1]);
    if(!lesson)return null;
    state.currentClass=lesson.classId;
    state.editLesson=lesson.id;
  }else if(action==='cancelLesson'){
    state.editLesson='';
  }else return null;
  return state;
}

function updateControls(){
  const actions=document.querySelector('.top-actions');
  if(!actions)return;
  const lang=document.documentElement.lang||'en';
  const copy=labels[lang]||labels.en;
  if(!actions.querySelector('.history-controls')){
    const controls=document.createElement('div');
    controls.className='history-controls';
    controls.setAttribute('role','group');
    controls.setAttribute('aria-label',lang==='he'?'ניווט בין עמודים':lang==='ar'?'التنقل بين الصفحات':'Page navigation');
    controls.innerHTML=`<button type="button" class="icon-button" data-browser-nav="back"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5m7 7-7-7 7-7"/></svg></button><button type="button" class="icon-button" data-browser-nav="forward"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg></button>`;
    actions.prepend(controls);
  }
  const back=actions.querySelector('[data-browser-nav="back"]');
  const forward=actions.querySelector('[data-browser-nav="forward"]');
  back.disabled=!(history.state?.schoolSignal&&history.state.index>0);
  forward.disabled=!(history.state?.schoolSignal&&history.state.canForward);
  back.setAttribute('aria-label',copy.back);
  back.title=copy.back;
  forward.setAttribute('aria-label',copy.forward);
  forward.title=copy.forward;
  let switchButton=actions.querySelector('.role-switch-header');
  if(!switchButton){
    switchButton=document.createElement('button');
    switchButton.type='button';
    switchButton.className='icon-button role-switch-header';
    switchButton.dataset.action='switch';
    switchButton.innerHTML='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5"/></svg>';
    actions.insertBefore(switchButton,actions.querySelector('[data-action="go:notifications"]'));
  }
  switchButton.setAttribute('aria-label',copy.switchRole);
  switchButton.title=copy.switchRole;
}

window.addEventListener('click',event=>{
  const target=event.target.closest('[data-browser-nav]');
  if(target){
    event.preventDefault();
    event.stopImmediatePropagation();
    if(!target.disabled)history[target.dataset.browserNav==='back'?'back':'forward']();
    return;
  }
  const actionTarget=event.target.closest('[data-action]');
  if(!actionTarget)return;
  const state=nextState(actionTarget.dataset.action);
  if(!state)return;
  history.replaceState({...history.state,canForward:true},'',location.href);
  state.schoolSignal=true;
  state.index=history.state.index+1;
  history.pushState(state,'',location.href);
  saveSession(state);
  updateControls();
},true);

window.addEventListener('popstate',event=>{
  if(!event.state?.schoolSignal)return;
  saveSession(event.state);
  window.dispatchEvent(new CustomEvent('school-signal:history', {detail:event.state}));
});

new MutationObserver(updateControls).observe(document.getElementById('app'),{childList:true,subtree:true});
