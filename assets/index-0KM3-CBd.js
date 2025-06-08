(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const s of t)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function o(t){const s={};return t.integrity&&(s.integrity=t.integrity),t.referrerPolicy&&(s.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?s.credentials="include":t.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(t){if(t.ep)return;t.ep=!0;const s=o(t);fetch(t.href,s)}})();const c="http://localhost:3000";async function l(){try{const e=await fetch(`${c}/lostItems`);if(!e.ok)throw new Error(`Error fetching lost items: ${e.statusText}`);return await e.json()}catch(e){return console.error("Failed to fetch lost items:",e),[]}}async function d(){try{const e=await fetch(`${c}/foundItems`);if(!e.ok)throw new Error(`Error fetching found items: ${e.statusText}`);return await e.json()}catch(e){return console.error("Failed to fetch found items:",e),[]}}async function m(){try{const[e,r]=await Promise.all([l(),d()]);return{lostItems:e,foundItems:r}}catch(e){return console.error("Failed to fetch all items:",e),{lostItems:[],foundItems:[]}}}async function u(e=6){try{const{lostItems:r,foundItems:o}=await m(),n=[...r.map(t=>({...t,type:"lost"})),...o.map(t=>({...t,type:"found"}))];return n.sort((t,s)=>new Date(s.createdAt)-new Date(t.createdAt)),n.slice(0,e)}catch(r){return console.error("Failed to fetch recent items:",r),[]}}const a=document.getElementById("recent-items-container");async function f(){await p()}async function p(){try{a.innerHTML='<div class="loading">Loading recent items...</div>';const e=await u(6);if(e.length===0){a.innerHTML=`
        <div class="empty-state">
          <h3>No Items Yet</h3>
          <p>Be the first to report a lost or found item!</p>
          <div class="buttons">
            <a href="report-lost.html" class="btn btn-primary">Report Lost Item</a>
            <a href="report-found.html" class="btn btn-secondary">Report Found Item</a>
          </div>
        </div>
      `;return}a.innerHTML="",e.forEach((r,o)=>{const n=h(r);n.style.animationDelay=`${o*.1}s`,a.appendChild(n)})}catch(e){console.error("Error loading recent items:",e),a.innerHTML=`
      <div class="error-state">
        <h3>Something went wrong</h3>
        <p>Failed to load recent items. Please try again later.</p>
      </div>
    `}}function h(e){const r=document.createElement("div");r.className=`item-card ${e.type} fade-in`;const o=new Date(e.date||e.createdAt).toLocaleDateString();return r.innerHTML=`
    <div class="item-card-header">
      <h3>${e.itemName}</h3>
      <span class="item-type ${e.type}">${e.type==="lost"?"Lost":"Found"}</span>
    </div>
    <div class="item-card-body">
      <div class="item-details">
        <div class="item-detail">
          <span class="item-detail-label">Category:</span>
          <span>${e.category||"Not specified"}</span>
        </div>
        <div class="item-detail">
          <span class="item-detail-label">Location:</span>
          <span>${e.location||"Not specified"}</span>
        </div>
        <div class="item-detail">
          <span class="item-detail-label">Date:</span>
          <span>${o}</span>
        </div>
      </div>
      <p class="item-description">${y(e.description,100)}</p>
    </div>
    <div class="item-card-footer">
      <span>Posted by: ${e.userName}</span>
      <a href="view-items.html" class="btn btn-primary contact-btn">View Details</a>
    </div>
  `,r}function y(e,r){return e?e.length<=r?e:e.substring(0,r)+"...":""}document.addEventListener("DOMContentLoaded",f);
