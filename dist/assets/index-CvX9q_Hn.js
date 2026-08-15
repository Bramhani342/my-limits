const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/notifications-CGxEhH2P.js","assets/notifications-CWXX60jh.js"])))=>i.map(i=>d[i]);
import{c as e,d as t,f as n,l as r,o as i,u as a}from"./notifications-CWXX60jh.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function o({month:e,records:t,onDateClick:n}){let r=e.getFullYear(),i=e.getMonth(),a=e.toLocaleString(`en-IN`,{month:`long`});document.getElementById(`monthYear`).textContent=`${a} ${r}`;let o=document.getElementById(`calendarDays`);o.innerHTML=``;let s=new Date(r,i,1).getDay(),l=new Date(r,i+1,0).getDate();for(let e=0;e<s;e++){let e=document.createElement(`div`);e.className=`calendar-empty`,o.appendChild(e)}let u=c(new Date);for(let e=1;e<=l;e++){let a=new Date(r,i,e),s=c(a),l=document.createElement(`button`);if(l.type=`button`,l.className=`calendar-day`,l.textContent=e,s===u&&l.classList.add(`today`),t.filter(e=>e.date===s).length>0){l.classList.add(`has-record`);let e=document.createElement(`span`);e.className=`record-dot`,l.appendChild(e)}l.addEventListener(`click`,()=>{n(a)}),o.appendChild(l)}}function s(e,t){let n=new Date(e);return n.setMonth(n.getMonth()+t),n}function c(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}var l=null,u=null;function d(e){let t=document.getElementById(`settingsButton`),n=document.getElementById(`addLimitButton`),r=document.getElementById(`manageAddButton`),i=document.getElementById(`closeManageModal`),a=document.getElementById(`closeLimitForm`),o=document.getElementById(`cancelLimitForm`),s=document.getElementById(`saveLimitButton`),c=document.getElementById(`stopLimitButton`),l=document.getElementById(`startDeleteButton`),d=document.getElementById(`cancelDeleteButton`),p=document.getElementById(`finishDeleteButton`),h=document.getElementById(`keepLimitButton`);t.addEventListener(`click`,async()=>{await f()}),n.addEventListener(`click`,()=>{m()}),r.addEventListener(`click`,()=>{g(`manageModal`),m()}),i.addEventListener(`click`,()=>{g(`manageModal`)}),a.addEventListener(`click`,()=>{g(`limitFormModal`)}),o.addEventListener(`click`,()=>{g(`limitFormModal`)}),s.addEventListener(`click`,async()=>{await ee(e)}),c.addEventListener(`click`,()=>{te()}),l.addEventListener(`click`,async()=>{await ne(e)}),d.addEventListener(`click`,()=>{u=null,g(`deleteRequestModal`)}),p.addEventListener(`click`,async()=>{await ie(e)}),h.addEventListener(`click`,async()=>{await ae(e)}),re()}async function f(){await p(),document.getElementById(`manageModal`).classList.remove(`hidden`)}async function p(){let e=document.getElementById(`manageLimitsList`);e.innerHTML=``;let t=(await r(`limits`)).filter(e=>e.active===!0);if(t.length===0){e.innerHTML=`
            <p class="empty-message">
                No active limits.
            </p>
        `;return}t.forEach(t=>{let n=document.createElement(`div`);n.className=`manage-limit-row`;let r=t.notifications?`🔔 ON`:`🔕 OFF`;n.innerHTML=`
            <div class="manage-limit-info">

                <strong>
                    ${t.name}
                </strong>

                <span>
                    ${t.limit} / ${t.period}
                </span>

                <span>
                    ${r}
                </span>

            </div>

            <button
                class="edit-limit-button"
                type="button"
            >
                ✏️
            </button>
        `,n.querySelector(`.edit-limit-button`).addEventListener(`click`,()=>{h(t)}),e.appendChild(n)})}function m(){l=null,document.getElementById(`limitFormTitle`).textContent=`Add New Limit`,document.getElementById(`limitNameInput`).value=``,document.getElementById(`limitValueInput`).value=``,document.getElementById(`limitPeriodInput`).value=`monthly`,document.getElementById(`notificationInput`).checked=!1,document.getElementById(`stopLimitButton`).classList.add(`hidden`),document.getElementById(`limitFormModal`).classList.remove(`hidden`)}function h(e){l=e.id,document.getElementById(`limitFormTitle`).textContent=`Edit Limit`,document.getElementById(`limitNameInput`).value=e.name,document.getElementById(`limitValueInput`).value=e.limit,document.getElementById(`limitPeriodInput`).value=e.period,document.getElementById(`notificationInput`).checked=e.notifications===!0,document.getElementById(`stopLimitButton`).classList.remove(`hidden`),g(`manageModal`),document.getElementById(`limitFormModal`).classList.remove(`hidden`)}async function ee(e){let t=document.getElementById(`limitNameInput`).value.trim(),a=Number(document.getElementById(`limitValueInput`).value),o=document.getElementById(`limitPeriodInput`).value,s=document.getElementById(`notificationInput`).checked;if(s&&await i()!==`granted`&&!window.confirm(`Browser notifications are not enabled.

You can still save this limit without reminders.

Save without notifications?`))return;if(!t){alert(`Please enter an item name.`);return}if(!Number.isInteger(a)||a<1){alert(`Please enter a valid limit.`);return}let c=await r(`limits`);if(l){let e=c.find(e=>e.id===l);if(!e){alert(`Limit could not be found.`);return}e.name=t,e.limit=a,e.period=o,e.notifications=s,await n(`limits`,e)}else{if(c.some(e=>e.active===!0&&e.name.toLowerCase()===t.toLowerCase())){alert(`An active limit with this name already exists.`);return}let e={id:`limit-`+Date.now()+`-`+Math.random().toString(36).slice(2),name:t,limit:a,period:o,notifications:s,active:!0,createdAt:new Date().toISOString()};await n(`limits`,e)}l=null,g(`limitFormModal`),await e()}async function te(){if(!l)return;let e=(await r(`limits`)).find(e=>e.id===l);if(e){if(e.active!==!0){alert(`This limit is already stopped.`);return}if((await r(`deletionRequests`)).find(t=>t.limitId===e.id&&t.status===`pending`)){alert(`A 24-hour stop request is already active for this limit.`);return}u=e.id,document.getElementById(`deleteRequestName`).textContent=`${e.name} will enter a 24-hour waiting period.`,g(`limitFormModal`),document.getElementById(`deleteRequestModal`).classList.remove(`hidden`)}}async function ne(e){if(!u)return;let t=(await r(`limits`)).find(e=>e.id===u);if(!t||t.active!==!0){u=null,g(`deleteRequestModal`);return}await n(`deletionRequests`,{limitId:u,requestedAt:Date.now(),status:`pending`}),g(`deleteRequestModal`),alert(`Deletion waiting period started.

You have 24 hours to reconsider.`),u=null,await e()}async function re(){let e=await r(`deletionRequests`);if(!e.length)return;let t=await r(`limits`),n=Date.now();for(let r of e){if(r.status!==`pending`||n-r.requestedAt<864e5)continue;let e=t.find(e=>e.id===r.limitId);if(e&&e.active===!0){u=e.id,document.getElementById(`finalDeleteName`).textContent=`${e.name} is ready to be stopped.`,document.getElementById(`finalDeleteModal`).classList.remove(`hidden`);break}}}async function ie(e){if(!u)return;let t=(await r(`limits`)).find(e=>e.id===u);if(!t){u=null,g(`finalDeleteModal`);return}t.active=!1,t.stoppedAt=new Date().toISOString(),await n(`limits`,t),await n(`deletionRequests`,{limitId:u,requestedAt:0,completedAt:new Date().toISOString(),status:`completed`}),g(`finalDeleteModal`),alert(`${t.name} has been stopped.\n\nIts old history is still preserved.`),u=null,await e()}async function ae(e){if(!u)return;let t=(await r(`limits`)).find(e=>e.id===u);if(!t){u=null,g(`finalDeleteModal`);return}await n(`deletionRequests`,{limitId:u,requestedAt:0,cancelledAt:new Date().toISOString(),status:`cancelled`}),g(`finalDeleteModal`),alert(`${t.name} will continue to be tracked.`),u=null,await e()}function g(e){let t=document.getElementById(e);t&&t.classList.add(`hidden`)}var _=[{title:`20-minute focused study`,description:`Spend 20 minutes learning or improving a useful skill.`},{title:`15-minute room or desk cleanup`,description:`Clean and organize your room, desk, or personal space for 15 minutes.`},{title:`20-minute reading session`,description:`Read a book or useful educational material for 20 minutes.`},{title:`20-minute walk`,description:`Take a normal 20-minute walk at a comfortable pace.`},{title:`15-minute personal organization`,description:`Organize your files, clothes, study materials, or another personal area for 15 minutes.`}];function v(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function y(e){return e instanceof Date||(e=new Date(e)),new Date(e.getFullYear(),e.getMonth(),e.getDate(),12,0,0,0)}function oe(e){let t=y(e);return{start:new Date(t.getFullYear(),t.getMonth(),1,0,0,0,0),end:new Date(t.getFullYear(),t.getMonth()+1,0,23,59,59,999)}}function se(e){let t=y(e),n=t.getDay(),r=n===0?6:n-1,i=new Date(t);i.setDate(i.getDate()-r),i.setHours(0,0,0,0);let a=new Date(i);return a.setDate(a.getDate()+6),a.setHours(23,59,59,999),{start:i,end:a}}function b(e,t){let n=y(t||new Date);return e===`weekly`?se(n):oe(n)}function ce(e,t){let n=b(e,t),r=new Date(n.start);return e===`weekly`?r.setDate(r.getDate()+7):r.setMonth(r.getMonth()+1),r}async function le(e,t){let n=(await r(`limits`)).find(t=>t.id===e);if(!n)return 0;let i=await r(`violations`),a=v(b(n.period,t).start);return i.filter(t=>t.limitId===e&&t.consequenceType===`deduct`&&t.deductionTargetPeriodStart===a).length}async function x(e,t){let n=y(t||new Date),i=(await r(`limits`)).find(t=>t.id===e);if(!i)return{used:0,baseAllowed:0,deduction:0,allowed:0,remaining:0,exceeded:!1,overBy:0,period:`monthly`,start:v(n),end:v(n)};let a=await r(`records`),o=b(i.period,n),s=v(o.start),c=v(o.end),l=a.filter(t=>t.limitId===e&&t.date>=s&&t.date<=c).length,u=Number(i.limit),d=await le(e,n),f=Math.max(0,u-d);return{used:l,baseAllowed:u,deduction:d,allowed:f,remaining:f-l,exceeded:l>=f,overBy:Math.max(0,l-f),period:i.period,start:s,end:c}}async function ue(e,t){let n=(await r(`limits`)).find(t=>t.id===e);if(!n)return{allowed:!1,needsConfirmation:!1,reason:`Limit not found.`};if(n.active!==!0)return{allowed:!1,needsConfirmation:!1,reason:`This limit is inactive.`};let i=await x(e,t);return i.used<i.allowed?{allowed:!0,needsConfirmation:!1,usage:i}:{allowed:!1,needsConfirmation:!0,usage:i}}async function de(e,t,i){let a=(await r(`limits`)).find(t=>t.id===e);if(!a)return null;if(!i)return console.error(`❌ Cannot create violation without recordId.`),null;let o=(await r(`records`)).find(e=>e.id===i);if(!o)return console.error(`❌ Cannot create violation. Record not found.`),null;if(o.limitId!==e)return console.error(`❌ Record does not belong to this limit.`),null;let s=await x(e,t),c=ce(a.period,t),l={id:`violation-`+Date.now()+`-`+Math.random().toString(36).slice(2),recordId:i,limitId:e,date:v(y(t)),period:s.period,periodStart:s.start,periodEnd:s.end,allowedAtViolation:s.allowed,usedAtViolation:s.used,createdAt:new Date().toISOString(),consequenceType:`pending`,consequenceStatus:`pending`,deductionTargetPeriodStart:v(c),punishmentTitle:null,punishmentDescription:null,punishmentCompletedAt:null};return await n(`violations`,l),l}async function fe(e){let t=(await r(`violations`)).find(t=>t.id===e);return t?(t.consequenceType=`deduct`,t.consequenceStatus=`applied`,t.consequenceUpdatedAt=new Date().toISOString(),await n(`violations`,t),t):null}async function pe(e){let t=(await r(`violations`)).find(t=>t.id===e);if(!t)return null;let i=_[Math.floor(Math.random()*_.length)];return t.consequenceType=`punishment`,t.consequenceStatus=`pending`,t.punishmentTitle=i.title,t.punishmentDescription=i.description,t.punishmentCompletedAt=null,t.consequenceUpdatedAt=new Date().toISOString(),await n(`violations`,t),t}async function me(e){let t=(await r(`violations`)).find(t=>t.id===e);return!t||t.consequenceType!==`punishment`?null:(t.consequenceStatus=`completed`,t.punishmentCompletedAt=new Date().toISOString(),await n(`violations`,t),t)}async function he(){return(await r(`violations`)).filter(e=>e.consequenceType===`punishment`&&e.consequenceStatus===`pending`)}var ge=`modulepreload`,_e=function(e){return`/`+e},S={},ve=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,import.meta.url).href}r=o(t.map(t=>{if(t=_e(t,n),t=s(t),t in S)return;S[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:ge,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},C=null;try{let e=await ve(()=>import(`./notifications-CGxEhH2P.js`),__vite__mapDeps([0,1]));typeof e.checkSmartNotifications==`function`&&(C=e.checkSmartNotifications)}catch(e){console.warn(`Smart notifications module not available.`,e)}var w=new Date(new Date().getFullYear(),new Date().getMonth(),1),T=new Date(w),E=null,D={enabled:!1,method:`pin`,pinHash:null,biometricCredential:null},O=!1;async function ye(){try{if(await t(),await be(),await B(),await xe(),Ne(),d(L),Re(),ze(),Ue(),Se(),await P(),Ye(),D.enabled&&Xe(),await L(),C&&await Ee())try{await C(x)}catch(e){console.warn(`Smart notification check failed:`,e)}console.log(`✅ My Limits started successfully.`)}catch(e){console.error(`❌ App startup error:`,e),document.body.innerHTML=`

            <div style="
                padding:30px;
                font-family:Arial,sans-serif;
            ">

                <h2>
                    ❌ My Limits Error
                </h2>

                <pre style="
                    white-space:pre-wrap;
                ">${$(e?.stack||e?.message||String(e))}</pre>

            </div>

        `}}async function be(){let e=document.getElementById(`appGreeting`);if(!e)return;let t=``;try{t=(await A(k.personal,{name:``}))?.name?.trim()||`Bramhani`}catch{t=`Bramhani`}let n=new Date().getHours(),r=`Welcome back`;r=n>=5&&n<12?`Good morning`:n>=12&&n<17?`Good afternoon`:n>=17&&n<22?`Good evening`:`Good night`,e.textContent=t?`${r}, ${t}`:`Stay within your rules.`}async function xe(){if(!(`serviceWorker`in navigator)){console.warn(`Service workers are not supported.`);return}try{let e=await navigator.serviceWorker.register(`/sw.js`,{scope:`/`});console.log(`✅ Service worker registered:`,e.scope)}catch(e){console.warn(`Service worker registration failed:`,e)}}function Se(){let e=document.getElementById(`settingsButton`),t=document.getElementById(`settingsModal`);if(!e||!t){console.warn(`Settings UI not found.`);return}let n=document.getElementById(`closeSettingsButton`),r=()=>{O||t.classList.remove(`hidden`)},i=()=>{t.classList.add(`hidden`)};e.addEventListener(`click`,r),n?.addEventListener(`click`,i),t.addEventListener(`click`,e=>{e.target===t&&i()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&!t.classList.contains(`hidden`)&&i()}),document.getElementById(`personalSettingsButton`)?.addEventListener(`click`,Ce),document.getElementById(`appearanceSettingsButton`)?.addEventListener(`click`,we),document.getElementById(`notificationSettingsButton`)?.addEventListener(`click`,Te),document.getElementById(`dataSettingsButton`)?.addEventListener(`click`,je),document.getElementById(`aboutSettingsButton`)?.addEventListener(`click`,Me)}var k={personal:`personal`,appearance:`appearance`,notifications:`notifications`};async function A(e,t=null){try{return(await a(`settings`,e))?.value??t}catch{return t}}async function j(e,t){await n(`settings`,{key:e,value:t})}function M(){document.getElementById(`settingsModal`)?.classList.add(`hidden`)}function N(e,t,n,r){let i=document.getElementById(e);return i||(i=document.createElement(`div`),i.id=e,i.className=`modal settings-feature-modal hidden`,i.innerHTML=`
            <div class="modal-card feature-modal-card">

                <div class="modal-handle"></div>

                <div class="modal-header">
                    <div>
                        <span class="modal-kicker">SETTINGS</span>
                        <h2>${$(t)}</h2>
                    </div>

                    <button
                        class="close-button settings-feature-close"
                        type="button"
                        aria-label="Close"
                    >×</button>
                </div>

                <p class="modal-subtitle">
                    ${$(n)}
                </p>

                <div class="settings-feature-body"></div>

            </div>
        `,document.body.appendChild(i),i.querySelector(`.settings-feature-close`)?.addEventListener(`click`,()=>{i.classList.add(`hidden`)}),i.addEventListener(`click`,e=>{e.target===i&&i.classList.add(`hidden`)})),i.querySelector(`.settings-feature-body`).innerHTML=r,i}async function Ce(){if(O)return;M();let e=await A(k.personal,{name:``,goal:``}),t=N(`personalSettingsFeatureModal`,`👤 Personal`,`Your personal preferences for My Limits.`,`
            <label class="form-label" for="personalNameInput">
                Your name
            </label>

            <input
                id="personalNameInput"
                class="form-input"
                type="text"
                maxlength="60"
                placeholder="Your name"
                autocomplete="name"
                value="${$(e?.name||``)}"
            >

            <label class="form-label" for="personalGoalInput">
                Personal goal
            </label>

            <textarea
                id="personalGoalInput"
                class="form-input settings-textarea"
                maxlength="300"
                placeholder="What do you want to stay consistent with?"
            >${$(e?.goal||``)}</textarea>

            <div class="settings-info-card">
                <span>🔒</span>
                <div>
                    <strong>Stored privately</strong>
                    <small>Your preferences are stored locally in this browser.</small>
                </div>
            </div>

            <button
                id="savePersonalSettingsButton"
                class="primary-button"
                type="button"
            >
                Save Personal Settings
            </button>
        `);t.classList.remove(`hidden`),t.querySelector(`#savePersonalSettingsButton`).onclick=async()=>{let e=document.getElementById(`personalNameInput`)?.value.trim()||``,n=document.getElementById(`personalGoalInput`)?.value.trim()||``;await j(k.personal,{name:e,goal:n}),t.classList.add(`hidden`),alert(`✅ Personal settings saved.`)}}async function P(){F((await A(k.appearance,{theme:`light`}))?.theme||`light`)}function F(e){let t=[`light`,`warm`,`dark`].includes(e)?e:`light`;t===`light`?document.documentElement.removeAttribute(`data-theme`):document.documentElement.setAttribute(`data-theme`,t)}async function we(){if(O)return;M();let e=(await A(k.appearance,{theme:`light`}))?.theme||`light`,t=N(`appearanceSettingsFeatureModal`,`🎨 Appearance`,`Choose the theme you want to use.`,`
            <div class="theme-choice-grid">

                <button class="theme-choice" data-theme-choice="light" type="button">
                    <span class="theme-preview light-preview">☀️</span>
                    <strong>Light</strong>
                    <small>Clean & bright</small>
                </button>

                <button class="theme-choice" data-theme-choice="warm" type="button">
                    <span class="theme-preview warm-preview">🌤️</span>
                    <strong>Warm</strong>
                    <small>Soft & calm</small>
                </button>

                <button class="theme-choice" data-theme-choice="dark" type="button">
                    <span class="theme-preview dark-preview">🌙</span>
                    <strong>Dark</strong>
                    <small>Low light</small>
                </button>

            </div>

            <div class="settings-info-card">
                <span>💾</span>
                <div>
                    <strong>Saved automatically</strong>
                    <small>Your theme remains selected after reopening the app.</small>
                </div>
            </div>
        `),n=()=>{t.querySelectorAll(`[data-theme-choice]`).forEach(t=>{t.classList.toggle(`selected`,t.dataset.themeChoice===e)})};t.querySelectorAll(`[data-theme-choice]`).forEach(t=>{t.onclick=async()=>{e=t.dataset.themeChoice||`light`,F(e),await j(k.appearance,{theme:e}),n()}}),n(),t.classList.remove(`hidden`)}async function Te(){if(O)return;M();let e=(await A(k.notifications,{enabled:!1}))?.enabled===!0,t=N(`notificationSettingsFeatureModal`,`🔔 Notifications`,`Choose whether My Limits can show reminder notifications.`,`
            <div class="settings-toggle-row">
                <div>
                    <strong>Reminder notifications</strong>
                    <small>Enable smart reminder checks when the app starts.</small>
                </div>

                <label class="switch">
                    <input id="globalNotificationToggle" type="checkbox" ${e?`checked`:``}>
                    <span class="slider"></span>
                </label>
            </div>

            <div class="settings-info-card">
                <span>🔔</span>
                <div>
                    <strong>Browser permission</strong>
                    <small id="notificationPermissionText"></small>
                </div>
            </div>

            <button
                id="requestNotificationPermissionButton"
                class="secondary-button"
                type="button"
            >
                Allow Browser Notifications
            </button>

            <button
                id="saveNotificationSettingsButton"
                class="primary-button"
                type="button"
            >
                Save Notification Settings
            </button>
        `),n=t.querySelector(`#globalNotificationToggle`),r=t.querySelector(`#notificationPermissionText`),i=t.querySelector(`#requestNotificationPermissionButton`),a=()=>{let e=`Notification`in window?Notification.permission:`unsupported`;r&&(r.textContent=e===`granted`?`Granted — browser notifications are allowed.`:e===`denied`?`Blocked — allow notifications in browser settings.`:e==="default"?`Not decided yet.`:`Notifications are not supported by this browser.`),i&&(i.disabled=e===`granted`||e===`unsupported`)};i.onclick=async()=>{if(!(`Notification`in window)){alert(`This browser does not support notifications.`);return}try{let t=await Notification.requestPermission();a(),t===`granted`&&(e=!0,n.checked=!0)}catch(e){console.warn(`Notification permission request failed:`,e)}},n.onchange=()=>{e=n.checked},t.querySelector(`#saveNotificationSettingsButton`).onclick=async()=>{await j(k.notifications,{enabled:e}),t.classList.add(`hidden`),alert(`✅ Notification settings saved.`)},a(),t.classList.remove(`hidden`)}async function Ee(){return(await A(k.notifications,{enabled:!1}))?.enabled===!0}var I=[`limits`,`records`,`violations`,`punishments`,`settings`];async function De(){let e={app:`My Limits`,version:`1.0.0`,exportedAt:new Date().toISOString(),data:{}};for(let t of I)try{e.data[t]=await r(t)}catch{e.data[t]=[]}return e}async function Oe(){for(let t of I){let n;try{n=await r(t)}catch{continue}for(let r of n){let n=r?.id??r?.key;if(n!=null)try{await e(t,n)}catch(e){console.warn(`Could not delete ${t} item`,e)}}}}async function ke(){try{let e=await De(),t=new Blob([JSON.stringify(e,null,2)],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`my-limits-backup-${Z(new Date)}.json`,document.body.appendChild(r),r.click(),r.remove(),URL.revokeObjectURL(n)}catch(e){console.error(`Export failed:`,e),alert(`❌ Could not export your data.`)}}async function Ae(e){try{let t=JSON.parse(await e.text());if(!t||t.app!==`My Limits`||!t.data||typeof t.data!=`object`)throw Error(`Invalid My Limits backup file.`);if(!window.confirm(`Restore this backup?

Your current app data will be replaced.`))return;await Oe();for(let e of I){let r=Array.isArray(t.data[e])?t.data[e]:[];for(let t of r)(t?.id!=null||t?.key!=null)&&await n(e,t)}await B(),await P(),await L(),alert(`✅ Backup restored successfully.`)}catch(e){console.error(`Restore failed:`,e),alert(`❌ Restore failed.\n\n${e?.message||String(e)}`)}}async function je(){if(O)return;M();let e=N(`dataSettingsFeatureModal`,`💾 Data & Privacy`,`Export, restore or clear your local My Limits data.`,`
            <div class="data-action-card">
                <span class="data-action-icon">📤</span>
                <div class="data-action-copy">
                    <strong>Export backup</strong>
                    <small>Download limits, records, violations, punishments and settings as JSON.</small>
                </div>
                <button id="exportDataButton" class="secondary-button compact-button" type="button">Export</button>
            </div>

            <div class="data-action-card">
                <span class="data-action-icon">📥</span>
                <div class="data-action-copy">
                    <strong>Restore backup</strong>
                    <small>Restore a JSON backup created by My Limits.</small>
                </div>
                <button id="restoreDataButton" class="secondary-button compact-button" type="button">Restore</button>
            </div>

            <div class="settings-danger-card">
                <span class="data-action-icon">🗑️</span>
                <div>
                    <strong>Clear all app data</strong>
                    <small>Removes limits, records, consequences and saved settings from this browser.</small>
                </div>
                <button id="clearDataButton" class="danger-button compact-button" type="button">Clear</button>
            </div>

            <input
                id="restoreDataFileInput"
                type="file"
                accept="application/json,.json"
                hidden
            >
        `);e.classList.remove(`hidden`),e.querySelector(`#exportDataButton`).onclick=ke;let t=e.querySelector(`#restoreDataFileInput`);e.querySelector(`#restoreDataButton`).onclick=()=>{t?.click()},t.onchange=async()=>{let e=t.files?.[0];e&&(await Ae(e),t.value=``)},e.querySelector(`#clearDataButton`).onclick=async()=>{window.confirm(`⚠️ Clear ALL My Limits data?

This includes limits, records, violations, punishments and settings.`)&&window.confirm(`FINAL CONFIRMATION

This cannot be undone unless you have an exported backup.

Continue?`)&&(await Oe(),D={enabled:!1,method:`pin`,pinHash:null,biometricCredential:null},F(`light`),e.classList.add(`hidden`),await L(),alert(`✅ All My Limits data has been cleared.`))}}async function Me(){O||(M(),N(`aboutSettingsFeatureModal`,`ℹ️ About My Limits`,`Information about this app and how it handles your data.`,`
            <div class="about-feature-card">

                <div class="about-logo">
                    <img
                        src="/icon-192.png"
                        alt="My Limits"
                    >
                </div>

                <h3 class="about-app-name">My Limits</h3>

                <p class="about-tagline">Your personal rules, made easier to follow.</p>

                <p class="about-personal-note">
                    Personalized for Bramhani.
                </p>

                <div class="about-info-list">
                    <div>
                        <span>Version</span>
                        <strong>1.0.0</strong>
                    </div>

                    <div>
                        <span>Storage</span>
                        <strong>Browser local storage</strong>
                    </div>

                    <div>
                        <span>Tracking</span>
                        <strong>Limits & history</strong>
                    </div>

                    <div>
                        <span>Security</span>
                        <strong>PIN / biometric App Lock</strong>
                    </div>
                </div>

                <p class="about-note">
                    My Limits is designed as a local-first personal tracking app. Use Data & Privacy whenever you want to export or restore a backup.
                </p>

            </div>
        `).classList.remove(`hidden`))}function Ne(){let e=document.getElementById(`previousMonth`),t=document.getElementById(`nextMonth`);e&&e.addEventListener(`click`,async()=>{O||(w=s(w,-1),w=new Date(w.getFullYear(),w.getMonth(),1),T=new Date(w),E=null,await L())}),t&&t.addEventListener(`click`,async()=>{O||(w=s(w,1),w=new Date(w.getFullYear(),w.getMonth(),1),T=new Date(w),E=null,await L())})}async function L(){if(O)return;let e=await r(`limits`),t=await r(`records`);o({month:w,records:t,onDateClick:R}),await Pe(e),await Le(),q()}async function Pe(e){let t=document.getElementById(`limitsSummary`);if(!t)return;t.innerHTML=``;let n=e.filter(e=>e.active===!0),r=w.toLocaleString(`en-IN`,{month:`long`,year:`numeric`}),i=document.createElement(`div`);if(i.className=`summary-period-title`,i.textContent=r,t.appendChild(i),n.length===0){let e=document.createElement(`div`);e.className=`empty-message`,e.innerHTML=`

            <p>
                No active limits yet.
            </p>

            <small>
                Add your first limit below.
            </small>

        `,t.appendChild(e);return}for(let e of n){let n;n=e.period===`weekly`?T:w;let i=await x(e.id,n),a=Number(i.used),o=Number(i.baseAllowed),s=Number(i.deduction),c=Number(i.allowed),l=Number(i.remaining),u=c>0?Math.min(100,a/c*100):0,d;d=e.period===`weekly`?`Week: ${ft(i.start)} – ${ft(i.end)}`:r;let f=``;s>0&&(f=`

                <div class="deduction-info">

                    Base limit:
                    ${o}

                    <br>

                    ⬇️ Previous violation:
                    -${s}

                    <br>

                    <strong>
                        Effective limit:
                        ${c}
                    </strong>

                </div>

            `);let p;p=l>0?`${l} remaining`:l===0?`Limit reached`:`${Math.abs(l)} over limit`;let m=document.createElement(`div`);m.className=`limit-card`,m.innerHTML=`

            <div class="limit-row">

                <span class="limit-name">

                    ${$(e.name)}

                </span>


                <strong>

                    ${a} / ${c}

                </strong>

            </div>


            <div class="limit-period">

                ${d}

            </div>


            ${f}


            <div class="progress-background">

                <div
                    class="progress-fill"
                    style="
                        width:${u}%;
                    "
                ></div>

            </div>


            <div
                class="
                    remaining
                    ${l<0?`exceeded`:``}
                "
            >

                ${p}

            </div>

        `,t.appendChild(m)}}async function R(t){if(O)return;E=new Date(t.getFullYear(),t.getMonth(),t.getDate()),T=new Date(E),w=new Date(E.getFullYear(),E.getMonth(),1);let n=Z(E),i=await r(`limits`),a=(await r(`records`)).filter(e=>e.date===n),o=document.getElementById(`selectedDateTitle`);o&&(o.textContent=dt(E));let s=document.getElementById(`dateItems`);if(!s)return;if(s.innerHTML=``,a.length>0){let t=document.createElement(`h3`);t.textContent=`Recorded`,t.className=`modal-section-heading`,s.appendChild(t);for(let t of a){let n=i.find(e=>e.id===t.limitId);if(!n)continue;let a=document.createElement(`div`);a.className=`record-row`,a.innerHTML=`

                <span>
                    ${$(n.name)}
                </span>

                <button
                    class="small-delete"
                    type="button"
                >
                    Remove
                </button>

            `,a.querySelector(`.small-delete`).addEventListener(`click`,async()=>{if(!window.confirm(`Remove ${n.name} from this day?`))return;await e(`records`,t.id);let i=[];try{i=await r(`violations`)}catch{i=[]}let a=i.filter(e=>e.limitId===t.limitId&&e.date===t.date);for(let t of a)await e(`violations`,t.id);await R(E),await L()}),s.appendChild(a)}}let c=document.createElement(`h3`);c.textContent=`Add something`,c.className=`modal-section-heading`,s.appendChild(c);let l=i.filter(e=>e.active===!0);if(l.length===0){let e=document.createElement(`p`);e.className=`history-empty`,e.textContent=`No active limits.`,s.appendChild(e)}for(let e of l){let t=await x(e.id,E),n=document.createElement(`button`);n.type=`button`,n.className=`food-button`,t.used>=t.allowed?(n.innerHTML=`

                <span>
                    ${$(e.name)}
                </span>

                <small>
                    ${t.used}/${t.allowed}
                    · Limit reached
                </small>

            `,n.classList.add(`limit-reached-button`)):n.innerHTML=`

                <span>
                    ${$(e.name)}
                </span>

                <small>
                    ${t.remaining}
                    remaining
                </small>

            `,n.addEventListener(`click`,async()=>{await Fe(e,E)}),s.appendChild(n)}let u=document.getElementById(`dateModal`);u&&u.classList.remove(`hidden`),await L()}async function Fe(e,t){if(O)return;let n=await ue(e.id,t);if(n.allowed){await Ie(e,t);return}if(n.needsConfirmation){let r=n.usage;if(!window.confirm(`⚠️ ${e.name}\n\n${r.period} limit reached.\n\nUsed: ${r.used} / ${r.allowed}\n\nDo you still want to record this?`))return;await Ie(e,t);let i=await de(e.id,t);if(!i)return;if(window.confirm(`⚠️ Limit violation recorded.

Choose your consequence:

OK = Deduct 1 from your next ${e.period===`weekly`?`week`:`month`}\n\nCancel = Give me a punishment`)){await fe(i.id);let t=e.period===`weekly`?`week`:`month`;alert(`⚠️ Consequence applied.\n\n1 will be deducted from your next ${t}.\n\nYour current period remains unchanged.`)}else{let e=await pe(i.id);e&&alert(`⚠️ Punishment assigned\n\n${e.punishmentTitle}\n\n${e.punishmentDescription}\n\nIt will remain pending until you complete it.`)}await R(t),await L()}}async function Ie(e,t){let r={id:`record-`+Date.now()+`-`+Math.random().toString(36).slice(2),limitId:e.id,date:Z(t),createdAt:new Date().toISOString()};return await n(`records`,r),r}async function Le(){let e=document.getElementById(`consequenceSection`),t=document.getElementById(`consequenceSummary`);if(!e||!t)return;let n=await he();if(t.innerHTML=``,n.length===0){e.classList.add(`hidden`);return}e.classList.remove(`hidden`);let i=await r(`limits`);for(let e of n){let n=i.find(t=>t.id===e.limitId),r=document.createElement(`div`);r.className=`punishment-card`,r.innerHTML=`

            <div class="punishment-title">

                ⚠️

                ${$(e.punishmentTitle)}

            </div>


            <div class="punishment-item">

                ${n?$(n.name):`Item`}

            </div>


            <div class="punishment-description">

                ${$(e.punishmentDescription)}

            </div>


            <div class="punishment-date">

                Violation:
                ${Q(e.date)}

            </div>


            <button
                class="primary-button"
                type="button"
            >

                ✓ I completed it

            </button>

        `,r.querySelector(`button`).addEventListener(`click`,async()=>{window.confirm(`Did you really complete this punishment?\n\n${e.punishmentTitle}`)&&(await me(e.id),await Le())}),t.appendChild(r)}}function Re(){let e=document.getElementById(`closeDateModal`),t=document.getElementById(`dateModal`);e&&t&&(e.addEventListener(`click`,()=>{t.classList.add(`hidden`)}),t.addEventListener(`click`,e=>{e.target===t&&t.classList.add(`hidden`)}))}function ze(){let e=document.getElementById(`historyButton`),t=document.getElementById(`closeHistoryModal`),n=document.getElementById(`historyModal`);e&&e.addEventListener(`click`,Be),t&&t.addEventListener(`click`,Ve),n&&n.addEventListener(`click`,e=>{e.target===n&&Ve()})}async function Be(){if(O)return;let e=await r(`limits`),t=await r(`records`),n=[];try{n=await r(`violations`)}catch{n=[]}let i=document.getElementById(`historyContent`);if(!i)return;i.innerHTML=``,e.length===0&&(i.innerHTML=`

            <p class="history-empty">
                No history yet.
            </p>

        `);for(let r of e){let e=t.filter(e=>e.limitId===r.id).sort((e,t)=>t.date.localeCompare(e.date)),a=n.filter(e=>e.limitId===r.id),o=document.createElement(`div`);o.className=`history-limit`;let s=r.active===!0?`Active`:`Stopped`;o.innerHTML=`

            <div class="history-limit-title">

                <strong>
                    ${$(r.name)}
                </strong>

                <span>
                    ${s}
                </span>

            </div>


            <div class="history-stats">

                <span>
                    ${e.length}
                    records
                </span>

                <span>
                    ${a.length}
                    violations
                </span>

            </div>

        `;for(let t of e){let e=document.createElement(`div`);e.className=`history-record`,e.textContent=Q(t.date),o.appendChild(e)}for(let e of a){let t=document.createElement(`div`);t.className=`history-violation`;let n;n=e.consequenceType===`deduct`?`⬇️ 1 deducted from next period`:e.consequenceType===`punishment`?e.consequenceStatus===`completed`?`✓ Punishment completed`:`⚠️ Punishment pending`:`Consequence pending`,t.innerHTML=`

                <strong>
                    ⚠️ Violation
                </strong>

                <span>
                    ${Q(e.date)}
                </span>

                <small>
                    ${n}
                </small>

            `,o.appendChild(t)}if(e.length===0&&a.length===0){let e=document.createElement(`p`);e.className=`history-empty`,e.textContent=`No records yet.`,o.appendChild(e)}i.appendChild(o)}let a=document.getElementById(`historyModal`);a&&a.classList.remove(`hidden`)}function Ve(){let e=document.getElementById(`historyModal`);e&&e.classList.add(`hidden`)}async function z(e){let t=new TextEncoder().encode(e),n=await crypto.subtle.digest(`SHA-256`,t);return Array.from(new Uint8Array(n)).map(e=>e.toString(16).padStart(2,`0`)).join(``)}async function B(){try{let e=await a(`settings`,`security`);if(e?.value){let t=e.value,n=t.pinHash||null;if(!n&&t.pin)try{n=await z(t.pin)}catch{n=null}D={enabled:t.enabled===!0,method:t.method||`pin`,pinHash:n,biometricCredential:t.biometricCredential||null},t.pin&&await V()}}catch(e){console.warn(`Could not load security settings:`,e)}}async function V(){await n(`settings`,{key:`security`,value:D})}function He(){if(!document.getElementById(`securitySettingsModal`)){let e=document.createElement(`div`);e.id=`securitySettingsModal`,e.className=`modal hidden`,e.innerHTML=`
            <div class="modal-card security-modal-card">

                <div class="modal-handle"></div>

                <div class="modal-header">
                    <div>
                        <span class="modal-kicker">PRIVACY</span>
                        <h2>🔐 App Security</h2>
                    </div>

                    <button
                        id="closeSecuritySettingsButton"
                        class="close-button"
                        type="button"
                        aria-label="Close"
                    >×</button>
                </div>

                <p class="modal-subtitle">
                    Protect My Limits when you open it.
                </p>

                <div class="notification-option">
                    <div class="notification-copy">
                        <div class="notification-title">
                            App Lock
                        </div>
                        <p>
                            Ask for authentication when My Limits opens.
                        </p>
                    </div>

                    <label class="switch">
                        <input
                            id="appLockEnabledInput"
                            type="checkbox"
                        >
                        <span class="slider"></span>
                    </label>
                </div>

                <div id="securityMethodSection">

                    <label class="form-label">
                        Unlock method
                    </label>

                    <div class="security-method-options">

                        <button
                            id="pinMethodButton"
                            class="secondary-button security-method-button"
                            type="button"
                        >
                            🔢 PIN
                            <span id="pinMethodCheck">✓</span>
                        </button>

                        <button
                            id="biometricMethodButton"
                            class="secondary-button security-method-button"
                            type="button"
                        >
                            👆 Biometric
                            <span id="biometricMethodCheck" class="hidden">✓</span>
                        </button>

                    </div>

                    <p
                        id="biometricAvailabilityText"
                        class="form-hint"
                    ></p>

                    <p
                        id="biometricUnavailableText"
                        class="form-hint hidden"
                    >
                        Device biometric authentication is not available here.
                    </p>

                </div>

                <p
                    id="securitySetupMessage"
                    class="security-setup-message hidden"
                ></p>

                <button
                    id="saveSecurityButton"
                    class="primary-button"
                    type="button"
                >
                    Save Security Settings
                </button>

                <button
                    id="cancelSecurityButton"
                    class="secondary-button"
                    type="button"
                >
                    Cancel
                </button>

            </div>
        `,document.body.appendChild(e)}if(!document.getElementById(`pinSetupModal`)){let e=document.createElement(`div`);e.id=`pinSetupModal`,e.className=`modal hidden`,e.innerHTML=`
            <div class="modal-card">

                <div class="modal-handle"></div>

                <div class="modal-header">
                    <div>
                        <span class="modal-kicker">APP SECURITY</span>
                        <h2>🔢 Create your PIN</h2>
                    </div>

                    <button
                        id="closePinSetupButton"
                        class="close-button"
                        type="button"
                        aria-label="Close"
                    >×</button>
                </div>

                <p class="modal-subtitle">
                    Create a 4–6 digit PIN. You will need it whenever App Lock is active.
                </p>

                <label class="form-label" for="newPinInput">
                    New PIN
                </label>

                <input
                    id="newPinInput"
                    class="form-input"
                    type="password"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    maxlength="6"
                    autocomplete="new-password"
                    placeholder="Enter PIN"
                >

                <label class="form-label" for="confirmPinInput">
                    Confirm PIN
                </label>

                <input
                    id="confirmPinInput"
                    class="form-input"
                    type="password"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    maxlength="6"
                    autocomplete="new-password"
                    placeholder="Enter PIN again"
                >

                <p
                    id="pinSetupError"
                    class="app-lock-error"
                ></p>

                <button
                    id="savePinButton"
                    class="primary-button"
                    type="button"
                >
                    Save PIN & Enable Lock
                </button>

                <button
                    id="cancelPinSetupButton"
                    class="secondary-button"
                    type="button"
                >
                    Cancel
                </button>

            </div>
        `,document.body.appendChild(e)}}function Ue(){He();let e=document.getElementById(`openSecuritySettingsButton`),t=document.getElementById(`closeSecuritySettingsButton`),n=document.getElementById(`cancelSecurityButton`),r=document.getElementById(`securitySettingsModal`),i=document.getElementById(`appLockEnabledInput`),a=document.getElementById(`pinMethodButton`),o=document.getElementById(`biometricMethodButton`),s=document.getElementById(`saveSecurityButton`),c=document.getElementById(`closePinSetupButton`),l=document.getElementById(`cancelPinSetupButton`),u=document.getElementById(`savePinButton`);e&&e.addEventListener(`click`,We),t&&t.addEventListener(`click`,H),n&&n.addEventListener(`click`,H),r&&r.addEventListener(`click`,e=>{e.target===r&&H()}),i&&i.addEventListener(`change`,Ge),a&&a.addEventListener(`click`,()=>U(`pin`)),o&&o.addEventListener(`click`,async()=>{if(!await K()){J(`Biometric authentication is not available on this device or browser.`,`warning`);return}U(`biometric`)}),s&&s.addEventListener(`click`,Ke),c&&c.addEventListener(`click`,W),l&&l.addEventListener(`click`,W),u&&u.addEventListener(`click`,Je),q()}async function We(){await B();let e=document.getElementById(`appLockEnabledInput`);e&&(e.checked=D.enabled),U(D.method||`pin`),Ge(),await $e(),rt();let t=document.getElementById(`securitySettingsModal`);t&&t.classList.remove(`hidden`)}function H(){let e=document.getElementById(`securitySettingsModal`);e&&e.classList.add(`hidden`),rt()}function Ge(){let e=document.getElementById(`appLockEnabledInput`),t=document.getElementById(`securityMethodSection`);!e||!t||t.classList.toggle(`hidden`,!e.checked)}function U(e){D.method=e;let t=document.getElementById(`pinMethodCheck`),n=document.getElementById(`biometricMethodCheck`);t&&t.classList.toggle(`hidden`,e!==`pin`),n&&n.classList.toggle(`hidden`,e!==`biometric`)}async function Ke(){let e=document.getElementById(`appLockEnabledInput`);if(!e)return;if(!e.checked){D.enabled=!1,await V(),q(),H(),alert(`🔓 App Lock is now OFF.`);return}let t=D.method||`pin`;if(t===`pin`){if(!D.pinHash){H(),qe();return}D.enabled=!0,await V(),q(),H(),alert(`🔐 App Lock enabled.

You will be asked for your PIN the next time you open My Limits.`);return}if(t===`biometric`){if(!await K()){J(`Biometric authentication is not available on this device or browser.`,`warning`);return}let e=await et();if(!e)return;D.enabled=!0,D.method=`biometric`,D.biometricCredential=e,await V(),q(),H(),alert(`👆 Biometric App Lock enabled.

Your device will ask for authentication the next time you open My Limits.`)}}function qe(){let e=document.getElementById(`newPinInput`),t=document.getElementById(`confirmPinInput`),n=document.getElementById(`pinSetupError`);e&&(e.value=``),t&&(t.value=``),n&&(n.textContent=``);let r=document.getElementById(`pinSetupModal`);r&&r.classList.remove(`hidden`),setTimeout(()=>{e?.focus()},100)}function W(){let e=document.getElementById(`pinSetupModal`);e&&e.classList.add(`hidden`)}async function Je(){let e=document.getElementById(`newPinInput`)?.value.trim(),t=document.getElementById(`confirmPinInput`)?.value.trim(),n=document.getElementById(`pinSetupError`);if(!/^\d{4,6}$/.test(e||``)){n&&(n.textContent=`PIN must contain 4 to 6 digits.`);return}if(e!==t){n&&(n.textContent=`PINs do not match.`);return}try{D.pinHash=await z(e),D.method=`pin`,D.enabled=!0,await V(),W(),q(),alert(`🔐 PIN saved successfully.

App Lock is now enabled.`)}catch(e){console.error(`Could not save PIN:`,e),n&&(n.textContent=`Could not save the PIN. Please try again.`)}}function Ye(){let e=document.getElementById(`unlockAppButton`),t=document.getElementById(`appLockPin`);e&&e.addEventListener(`click`,Qe),t&&t.addEventListener(`keydown`,async e=>{e.key===`Enter`&&await Qe()})}function Xe(){if(!D.enabled)return;O=!0;let e=document.getElementById(`app`);e&&e.classList.add(`app-content-locked`);let t=document.getElementById(`appLockScreen`);t&&t.classList.remove(`hidden`),Ze(),setTimeout(()=>{D.method===`biometric`?tt():document.getElementById(`appLockPin`)?.focus()},250)}function Ze(){let e=document.getElementById(`appLockScreen`);if(!e)return;let t=document.getElementById(`biometricUnlockButton`),n=document.getElementById(`appLockPin`),r=document.getElementById(`unlockAppButton`);D.method===`biometric`?(n?.classList.add(`hidden`),r?.classList.add(`hidden`),t||(t=document.createElement(`button`),t.id=`biometricUnlockButton`,t.className=`primary-button`,t.type=`button`,t.textContent=`👆 Unlock with biometric`,t.addEventListener(`click`,tt),e.querySelector(`.app-lock-card`)?.appendChild(t)),t.classList.remove(`hidden`)):(n?.classList.remove(`hidden`),r?.classList.remove(`hidden`),t?.classList.add(`hidden`))}async function Qe(){if(!D.enabled){G();return}if(D.method!==`pin`)return;let e=document.getElementById(`appLockPin`),t=document.getElementById(`appLockError`),n=document.getElementById(`unlockAppButton`),r=e?.value.trim();if(!/^\d{4,6}$/.test(r||``)){t&&(t.textContent=`Enter your 4–6 digit PIN.`);return}if(!D.pinHash){t&&(t.textContent=`PIN security is not configured correctly. Open Security Settings.`);return}n&&(n.disabled=!0,n.textContent=`Checking...`);try{await z(r)===D.pinHash?(t&&(t.textContent=``),e&&(e.value=``),await G()):(t&&(t.textContent=`Incorrect PIN. Try again.`),e&&(e.value=``,e.focus(),e.classList.remove(`app-lock-shake`),e.offsetWidth,e.classList.add(`app-lock-shake`)))}catch(e){console.error(`PIN unlock error:`,e),t&&(t.textContent=`Unable to verify PIN. Please try again.`)}finally{n&&(n.disabled=!1,n.textContent=`Unlock`)}}async function G(){O=!1;let e=document.getElementById(`appLockScreen`);e&&e.classList.add(`hidden`);let t=document.getElementById(`app`);t&&t.classList.remove(`app-content-locked`),await L()}async function K(){try{return!window.PublicKeyCredential||typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable!=`function`?!1:await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()}catch{return!1}}async function $e(){let e=document.getElementById(`biometricMethodButton`),t=document.getElementById(`biometricAvailabilityText`),n=document.getElementById(`biometricUnavailableText`),r=await K();e&&(e.disabled=!r),t&&(t.textContent=r?`Use your device authentication`:`Not available on this device`),n?.classList.toggle(`hidden`,r),!r&&D.method===`biometric`&&U(`pin`)}async function et(){if(!await K())return J(`Biometric authentication is not available.`,`warning`),null;try{let e=X(32),t=X(16),n=await navigator.credentials.create({publicKey:{challenge:e,rp:{name:`My Limits`,id:location.hostname===`localhost`?`localhost`:location.hostname},user:{id:t,name:`my-limits-user`,displayName:`My Limits User`},pubKeyCredParams:[{type:`public-key`,alg:-7},{type:`public-key`,alg:-257}],authenticatorSelection:{authenticatorAttachment:`platform`,userVerification:`required`,residentKey:`preferred`},timeout:6e4,attestation:`none`}});if(!n)return null;let r=n.response,i=null;if(typeof r.getPublicKey==`function`){let e=r.getPublicKey();e&&(i=at(e))}if(!i)return J(`This browser cannot securely store the biometric credential required by My Limits. Please use PIN.`,`warning`),null;let a=-7;if(typeof r.getPublicKeyAlgorithm==`function`)try{a=r.getPublicKeyAlgorithm()}catch{a=-7}return{id:ot(n.rawId),publicKey:i,algorithm:a,createdAt:new Date().toISOString()}}catch(e){return console.warn(`Biometric registration failed:`,e),J(it(e),`warning`),null}}async function tt(){if(D.method!==`biometric`)return;let e=D.biometricCredential;if(!e){Y(`Biometric setup is incomplete. Please use PIN from Security Settings.`);return}try{let t=X(32),n=await navigator.credentials.get({publicKey:{challenge:t,rpId:location.hostname===`localhost`?`localhost`:location.hostname,allowCredentials:[{type:`public-key`,id:ct(e.id)}],userVerification:`required`,timeout:6e4}});if(!n){Y(`Biometric authentication was cancelled.`);return}await nt(n,t,e)?await G():Y(`Biometric verification failed.`)}catch(e){console.warn(`Biometric unlock failed:`,e),Y(it(e))}}async function nt(e,t,n){try{let r=e.response,i=new Uint8Array(r.clientDataJSON),a=new Uint8Array(r.authenticatorData),o=new Uint8Array(r.signature),s=JSON.parse(new TextDecoder().decode(i));if(s.type!==`webauthn.get`)return!1;let c=ot(t);if(s.challenge!==c||s.origin!==window.location.origin||a.length<37||!lt(a.slice(0,32),new Uint8Array(await crypto.subtle.digest(`SHA-256`,new TextEncoder().encode(location.hostname===`localhost`?`localhost`:location.hostname)))))return!1;let l=a[32];if(!(l&1)||!(l&4))return!1;let u=ut(a,new Uint8Array(await crypto.subtle.digest(`SHA-256`,i))),d=st(n.publicKey),f=n.algorithm===-257?{name:`RSASSA-PKCS1-v1_5`,hash:`SHA-256`}:{name:`ECDSA`,namedCurve:`P-256`},p=await crypto.subtle.importKey(`spki`,d,f,!1,[`verify`]);return n.algorithm===-257?await crypto.subtle.verify({name:`RSASSA-PKCS1-v1_5`},p,o,u):await crypto.subtle.verify({name:`ECDSA`,hash:`SHA-256`},p,o,u)}catch(e){return console.warn(`Biometric assertion verification error:`,e),!1}}function q(){let e=document.getElementById(`securityStatusText`),t=document.getElementById(`securityStatusBadge`);!e||!t||(D.enabled?(e.textContent=D.method===`biometric`?`Biometric App Lock is ON`:`PIN App Lock is ON`,t.textContent=`ON`,t.classList.remove(`off`),t.classList.add(`on`)):(e.textContent=`App Lock is OFF`,t.textContent=`OFF`,t.classList.remove(`on`),t.classList.add(`off`)))}function J(e,t=`info`){let n=document.getElementById(`securitySetupMessage`);n&&(n.textContent=e,n.className=`security-setup-message ${t}`,n.classList.remove(`hidden`))}function rt(){let e=document.getElementById(`securitySetupMessage`);e&&(e.textContent=``,e.classList.add(`hidden`))}function Y(e){let t=document.getElementById(`appLockError`);t&&(t.textContent=e)}function it(e){return e?.name===`NotAllowedError`?`Biometric authentication was cancelled or not accepted.`:e?.name===`InvalidStateError`?`This biometric credential is already in use.`:e?.name===`NotSupportedError`?`Biometric authentication is not supported here.`:`Biometric authentication could not be completed.`}function X(e){let t=new Uint8Array(e);return crypto.getRandomValues(t),t}function at(e){let t=new Uint8Array(e),n=``;for(let e of t)n+=String.fromCharCode(e);return btoa(n)}function ot(e){return at(e).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}function st(e){let t=atob(e),n=new Uint8Array(t.length);for(let e=0;e<t.length;e++)n[e]=t.charCodeAt(e);return n.buffer}function ct(e){let t=e.replace(/-/g,`+`).replace(/_/g,`/`);for(;t.length%4;)t+=`=`;return st(t)}function lt(e,t){if(e.length!==t.length)return!1;for(let n=0;n<e.length;n++)if(e[n]!==t[n])return!1;return!0}function ut(e,t){let n=new Uint8Array(e.length+t.length);return n.set(e,0),n.set(t,e.length),n}function Z(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function dt(e){return e.toLocaleDateString(`en-IN`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`})}function ft(e){let t=e.split(`-`);return t.length===3?new Date(Number(t[0]),Number(t[1])-1,Number(t[2])).toLocaleDateString(`en-IN`,{day:`numeric`,month:`short`}):e}function Q(e){let t=e.split(`-`);return t.length===3?new Date(Number(t[0]),Number(t[1])-1,Number(t[2])).toLocaleDateString(`en-IN`,{day:`numeric`,month:`short`,year:`numeric`}):e}function $(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}ye();