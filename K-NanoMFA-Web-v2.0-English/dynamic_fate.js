(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.KNanoDynamicFate=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const VERSION='2.0';
  const SECONDS_PER_YEAR=365.25*24*3600;
  const COMPARTMENTS=['air','water','soil','sediment'];
  const FORMS=['matrix_bound','free_particle','small_aggregate','large_aggregate','dissolved','transformed_particle','unresolved'];
  const COMPARTMENT_LABELS={air:'Air',water:'Surface water',soil:'Soil',sediment:'Active sediment'};
  const FORM_LABELS={
    matrix_bound:'Matrix-bound form',free_particle:'Free nanoparticle',small_aggregate:'Small aggregate',
    large_aggregate:'Large aggregate',dissolved:'Dissolved constituent',
    transformed_particle:'Transformed particulate form',unresolved:'Unresolved form'
  };

  const RATE_LABELS={
    air_matrix_weathering_y:'Air: matrix weathering → free particle',
    water_matrix_weathering_y:'Water: matrix weathering → free particle',
    soil_matrix_weathering_y:'Soil: matrix weathering → free particle',
    sediment_matrix_weathering_y:'Sediment: matrix weathering → free particle',
    air_free_to_small_y:'Air: free particle → small aggregate',
    water_free_to_small_y:'Water: free particle → small aggregate',
    soil_free_to_small_y:'Soil: free particle → small aggregate',
    sediment_free_to_small_y:'Sediment: free particle → small aggregate',
    air_small_to_large_y:'Air: small → large aggregate',
    water_small_to_large_y:'Water: small → large aggregate',
    soil_small_to_large_y:'Soil: small → large aggregate',
    sediment_small_to_large_y:'Sediment: small → large aggregate',
    air_large_fragmentation_y:'Air: large → small aggregate',
    water_large_fragmentation_y:'Water: large → small aggregate',
    soil_large_fragmentation_y:'Soil: large → small aggregate',
    sediment_large_fragmentation_y:'Sediment: large → small aggregate',
    air_particulate_dissolution_y:'Air: particulate dissolution',
    water_free_dissolution_y:'Water: free-particle dissolution',
    water_small_dissolution_y:'Water: small-aggregate dissolution',
    water_large_dissolution_y:'Water: large-aggregate dissolution',
    soil_particulate_dissolution_y:'Soil: particulate dissolution',
    sediment_particulate_dissolution_y:'Sediment: particulate dissolution',
    air_particulate_transformation_y:'Air: particulate transformation',
    water_particulate_transformation_y:'Water: particulate transformation',
    soil_particulate_transformation_y:'Soil: particulate transformation / aging',
    sediment_particulate_transformation_y:'Sediment: particulate transformation',
    water_dissolved_reprecipitation_y:'Water: dissolved → transformed particulate',
    soil_dissolved_reprecipitation_y:'Soil: dissolved → transformed particulate',
    sediment_dissolved_reprecipitation_y:'Sediment: dissolved → transformed particulate',
    water_transformed_dissolution_y:'Water: transformed particulate dissolution',
    soil_transformed_dissolution_y:'Soil: transformed particulate dissolution',
    sediment_transformed_dissolution_y:'Sediment: transformed particulate dissolution',
    air_to_water_y:'Air deposition to water',
    air_to_soil_y:'Air deposition to soil',
    water_to_soil_y:'Water transfer to soil',
    soil_runoff_to_water_y:'Soil runoff to water',
    soil_erosion_to_sediment_y:'Soil erosion to sediment',
    soil_to_air_y:'Soil resuspension to air',
    sediment_resuspension_to_water_y:'Sediment resuspension to water',
    sediment_dissolved_exchange_to_water_y:'Sediment dissolved exchange to water',
    water_matrix_settling_y:'Water: matrix-associated settling',
    water_free_settling_y:'Water: free-particle settling',
    water_small_settling_y:'Water: small-aggregate settling',
    water_large_settling_y:'Water: large-aggregate settling',
    water_transformed_settling_y:'Water: transformed-particle settling',
    water_unresolved_settling_y:'Water: unresolved-form settling',
    air_advective_y:'Air advective removal',
    water_advective_particulate_y:'Water advective particulate removal',
    water_advective_dissolved_y:'Water advective dissolved removal',
    soil_irreversible_retention_y:'Soil irreversible retention below active layer',
    sediment_burial_y:'Sediment burial below active layer',
    air_non_nano_loss_y:'Air transformation to non-nano sink',
    water_non_nano_loss_y:'Water transformation to non-nano sink',
    soil_non_nano_loss_y:'Soil transformation to non-nano sink',
    sediment_non_nano_loss_y:'Sediment transformation to non-nano sink'
  };

  function baseRates(){return {
    air_matrix_weathering_y:0.15,water_matrix_weathering_y:0.35,soil_matrix_weathering_y:0.08,sediment_matrix_weathering_y:0.03,
    air_free_to_small_y:1.5,water_free_to_small_y:2.2,soil_free_to_small_y:0.7,sediment_free_to_small_y:0.35,
    air_small_to_large_y:0.35,water_small_to_large_y:0.85,soil_small_to_large_y:0.25,sediment_small_to_large_y:0.18,
    air_large_fragmentation_y:0.08,water_large_fragmentation_y:0.12,soil_large_fragmentation_y:0.03,sediment_large_fragmentation_y:0.02,
    air_particulate_dissolution_y:0.01,water_free_dissolution_y:0.08,water_small_dissolution_y:0.04,water_large_dissolution_y:0.015,
    soil_particulate_dissolution_y:0.015,sediment_particulate_dissolution_y:0.008,
    air_particulate_transformation_y:0.04,water_particulate_transformation_y:0.08,soil_particulate_transformation_y:0.12,sediment_particulate_transformation_y:0.07,
    water_dissolved_reprecipitation_y:0.03,soil_dissolved_reprecipitation_y:0.12,sediment_dissolved_reprecipitation_y:0.18,
    water_transformed_dissolution_y:0.01,soil_transformed_dissolution_y:0.004,sediment_transformed_dissolution_y:0.003,
    air_to_water_y:18,air_to_soil_y:45,water_to_soil_y:0.015,soil_runoff_to_water_y:0.01,soil_erosion_to_sediment_y:0.004,soil_to_air_y:0.002,
    sediment_resuspension_to_water_y:0.025,sediment_dissolved_exchange_to_water_y:0.05,
    water_matrix_settling_y:0.55,water_free_settling_y:0.12,water_small_settling_y:0.65,water_large_settling_y:3.5,water_transformed_settling_y:1.1,water_unresolved_settling_y:0.35,
    air_advective_y:20,water_advective_particulate_y:4,water_advective_dissolved_y:12,soil_irreversible_retention_y:0.015,sediment_burial_y:0.04,
    air_non_nano_loss_y:0.01,water_non_nano_loss_y:0.02,soil_non_nano_loss_y:0.025,sediment_non_nano_loss_y:0.018
  };}

  function scaleRates(overrides){return {...baseRates(),...overrides};}
  const PRESETS={
    persistent_oxide:{label:'Persistent mineral oxide',rates:scaleRates({})},
    dissolving_metal:{label:'Dissolving metal or metal oxide',rates:scaleRates({water_free_dissolution_y:1.2,water_small_dissolution_y:0.65,water_large_dissolution_y:0.25,soil_particulate_dissolution_y:0.18,sediment_particulate_dissolution_y:0.1,water_non_nano_loss_y:0.12,soil_non_nano_loss_y:0.08})},
    carbonaceous:{label:'Persistent carbonaceous nanomaterial',rates:scaleRates({air_particulate_dissolution_y:0,water_free_dissolution_y:0,water_small_dissolution_y:0,water_large_dissolution_y:0,soil_particulate_dissolution_y:0,sediment_particulate_dissolution_y:0,water_non_nano_loss_y:0.004,soil_non_nano_loss_y:0.004,sediment_non_nano_loss_y:0.003})},
    biodegradable:{label:'Biodegradable nanomaterial',rates:scaleRates({water_non_nano_loss_y:0.35,soil_non_nano_loss_y:0.28,sediment_non_nano_loss_y:0.18,air_non_nano_loss_y:0.08,soil_particulate_transformation_y:0.3})},
    high_aspect_ratio:{label:'High-aspect-ratio nanoform',rates:scaleRates({water_free_to_small_y:0.45,water_small_to_large_y:0.22,water_free_settling_y:0.3,water_small_settling_y:0.9,water_large_settling_y:2.5,water_free_dissolution_y:0,water_small_dissolution_y:0,water_large_dissolution_y:0})},
    custom:{label:'Custom kinetic parameter set',rates:scaleRates({})}
  };

  const clone=x=>JSON.parse(JSON.stringify(x));
  const num=x=>Number.isFinite(Number(x))?Number(x):0;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const sum=o=>Object.values(o||{}).reduce((a,b)=>a+num(b),0);
  const zeroForms=()=>Object.fromEntries(FORMS.map(k=>[k,0]));
  const zeroStocks=()=>Object.fromEntries(COMPARTMENTS.map(c=>[c,zeroForms()]));
  const totalStocks=s=>COMPARTMENTS.reduce((a,c)=>a+sum(s?.[c]),0);
  const addFlux=(obj,key,v)=>obj[key]=(obj[key]||0)+num(v);
  const addForm=(target,form,mass)=>target[form]=(target[form]||0)+num(mass);
  const safeProfile=(p)=>{const out=zeroForms(),t=FORMS.reduce((a,k)=>a+Math.max(0,num(p?.[k])),0);FORMS.forEach(k=>out[k]=t>0?Math.max(0,num(p?.[k]))/t:0);return out;};

  function defaultState(){return {
    schema:'K-NanoMFA-dynamic-nanoform-fate-v2',enabled:false,preset:'persistent_oxide',substeps_per_year:12,
    water_residence_time_days:30,large_fraction_of_aggregated_pct:35,max_static_years:500,convergence_tolerance:1e-7,
    rates:clone(PRESETS.persistent_oxide.rates),
    initial_stock_kg:{air:0,water:0,soil:0,sediment:0},
    initial_profile_pct:{matrix_bound:10,free_particle:20,small_aggregate:35,large_aggregate:20,dissolved:5,transformed_particle:5,unresolved:5},
    storm:{enabled:false,event_years:'',soil_to_water_pct:1.5,soil_to_sediment_pct:0.7,sediment_to_water_pct:0.5},
    external_coupling:{enabled:false,rows:[],source_note:''},
    uncertainty:{enabled:false,iterations:100,seed:73,cv:0.25,group_correlation:0.3},
    evidence_class:'E',source_note:'Screening kinetic parameters; replace with nanoform-, medium-, and process-specific evidence.',
    limitations:'First-order, spatially aggregated state-transition model. It does not resolve full particle-size distributions, geochemistry, watershed hydraulics, or local concentration gradients.'
  };}

  let state=defaultState(),lastResult=null,lastNanoform=null,lastContext=null,lastOutput=null,lastUncertainty=null,app=null,initialized=false;

  function applyPreset(name){state.preset=PRESETS[name]?name:'persistent_oxide';state.rates=clone(PRESETS[state.preset].rates);renderAll();refresh();return getState();}

  function capacities(region,env,config){
    const area=Math.max(num(region?.area_km2),1e-30),airH=Math.max(num(env?.air_mixing_height_m),1e-30);
    const waterResidence=Math.max(num(config.water_residence_time_days),0.01)/365.25;
    return {
      air_volume_m3:area*1e6*airH,
      water_volume_m3:Math.max(num(env?.river_flow_m3_s)*SECONDS_PER_YEAR*waterResidence,1e-30),
      soil_mass_kg:Math.max(num(env?.soil_area_ha)*10000*num(env?.soil_depth_m)*num(env?.soil_bulk_density_kg_m3),1e-30),
      sediment_mass_kg:Math.max(num(env?.sediment_area_km2)*1e6*num(env?.sediment_depth_m)*num(env?.sediment_bulk_density_kg_m3),1e-30)
    };
  }

  function concentrations(stocks,caps){
    const factors={air:1e12/caps.air_volume_m3,water:1e6/caps.water_volume_m3,soil:1e9/caps.soil_mass_kg,sediment:1e9/caps.sediment_mass_kg};
    const units={air:'ng/m³',water:'µg/L',soil:'µg/kg',sediment:'µg/kg'};
    const rows=[],total={};
    COMPARTMENTS.forEach(c=>{total[c]=0;FORMS.forEach(f=>{const value=num(stocks?.[c]?.[f])*factors[c];total[c]+=value;rows.push({compartment:c,form:f,value,unit:units[c]});});});
    return {total,rows,units};
  }

  function mapNanoformMedium(nfRow,config=state){
    const out=zeroForms(),large=clamp(num(config.large_fraction_of_aggregated_pct),0,100)/100;
    out.matrix_bound=num(nfRow?.matrix_bound);
    out.free_particle=num(nfRow?.free_particulate);
    out.small_aggregate=num(nfRow?.aggregated)*(1-large);
    out.large_aggregate=num(nfRow?.aggregated)*large;
    out.dissolved=num(nfRow?.dissolved);
    out.transformed_particle=num(nfRow?.transformed_particulate);
    out.unresolved=num(nfRow?.unresolved);
    return {forms:out,immediate_non_nano_sink_kg:num(nfRow?.non_nano_destroyed)};
  }

  function emissionsFromNanoform(nanoformOutput,config=state){
    if(!nanoformOutput)return [];
    if(Array.isArray(nanoformOutput.annual))return nanoformOutput.annual.map(row=>{
      const media={air:row.environmental?.air||{},water:row.environmental?.surface_water||{},soil:row.environmental?.soil||{},sediment:{}};
      const emissions=zeroStocks();let immediate=0;
      COMPARTMENTS.forEach(c=>{const mapped=mapNanoformMedium(media[c],config);emissions[c]=mapped.forms;immediate+=mapped.immediate_non_nano_sink_kg;});
      return {year:num(row.year),emissions,immediate_non_nano_sink_kg:immediate};
    });
    const source=nanoformOutput.environmental?.by_medium||nanoformOutput.final_environmental?.by_medium||{};
    const emissions=zeroStocks();let immediate=0;
    const media={air:source.air||{},water:source.surface_water||{},soil:source.soil||{},sediment:{}};
    COMPARTMENTS.forEach(c=>{const mapped=mapNanoformMedium(media[c],config);emissions[c]=mapped.forms;immediate+=mapped.immediate_non_nano_sink_kg;});
    return [{year:null,emissions,immediate_non_nano_sink_kg:immediate}];
  }

  function emissionsFromExternal(config=state){
    const grouped=new Map();
    (config.external_coupling?.rows||[]).forEach(r=>{
      const year=num(r.year),c=String(r.compartment||r.medium||'').toLowerCase(),f=String(r.form||r.state||'').toLowerCase();
      if(!COMPARTMENTS.includes(c)||!FORMS.includes(f))return;
      if(!grouped.has(year))grouped.set(year,{year,emissions:zeroStocks(),immediate_non_nano_sink_kg:0});
      addForm(grouped.get(year).emissions[c],f,Math.max(0,num(r.mass_kg_y)));
    });
    return [...grouped.values()].sort((a,b)=>a.year-b.year);
  }

  function initialStocks(config=state){
    const stocks=zeroStocks(),p=safeProfile(config.initial_profile_pct);
    COMPARTMENTS.forEach(c=>FORMS.forEach(f=>stocks[c][f]=Math.max(0,num(config.initial_stock_kg?.[c]))*p[f]));
    return stocks;
  }

  function path(targetComp,targetForm,rate,key){return {kind:'transfer',targetComp,targetForm,rate:Math.max(0,num(rate)),key};}
  function sinkPath(name,rate){return {kind:'sink',name,rate:Math.max(0,num(rate))};}

  function pathsFor(comp,form,r){
    const p=[];
    const add=(x)=>{if(x.rate>0)p.push(x);};
    const k=(name)=>num(r[name]);
    if(form==='matrix_bound')add(path(comp,'free_particle',k(`${comp}_matrix_weathering_y`),`${comp}_matrix_weathering`));
    if(form==='free_particle')add(path(comp,'small_aggregate',k(`${comp}_free_to_small_y`),`${comp}_free_to_small`));
    if(form==='small_aggregate')add(path(comp,'large_aggregate',k(`${comp}_small_to_large_y`),`${comp}_small_to_large`));
    if(form==='large_aggregate')add(path(comp,'small_aggregate',k(`${comp}_large_fragmentation_y`),`${comp}_large_fragmentation`));

    const particulate=['matrix_bound','free_particle','small_aggregate','large_aggregate'];
    if(particulate.includes(form)){
      let d=0;
      if(comp==='air')d=k('air_particulate_dissolution_y');
      else if(comp==='water')d=k(form==='free_particle'?'water_free_dissolution_y':form==='small_aggregate'?'water_small_dissolution_y':form==='large_aggregate'?'water_large_dissolution_y':'water_large_dissolution_y');
      else d=k(`${comp}_particulate_dissolution_y`);
      add(path(comp,'dissolved',d,`${comp}_${form}_dissolution`));
      add(path(comp,'transformed_particle',k(`${comp}_particulate_transformation_y`),`${comp}_${form}_transformation`));
    }
    if(form==='dissolved')add(path(comp,'transformed_particle',k(`${comp}_dissolved_reprecipitation_y`),`${comp}_dissolved_reprecipitation`));
    if(form==='transformed_particle')add(path(comp,'dissolved',k(`${comp}_transformed_dissolution_y`),`${comp}_transformed_dissolution`));

    if(comp==='air'){
      add(path('water',form,k('air_to_water_y'),'air_to_water'));
      add(path('soil',form,k('air_to_soil_y'),'air_to_soil'));
      add(sinkPath(`air_advective.${form}`,k('air_advective_y')));
      if(form!=='unresolved')add(sinkPath(`air_non_nano.${form}`,k('air_non_nano_loss_y')));
    }else if(comp==='water'){
      if(form!=='dissolved'){
        const settleKey=form==='matrix_bound'?'water_matrix_settling_y':form==='free_particle'?'water_free_settling_y':form==='small_aggregate'?'water_small_settling_y':form==='large_aggregate'?'water_large_settling_y':form==='transformed_particle'?'water_transformed_settling_y':'water_unresolved_settling_y';
        add(path('sediment',form,k(settleKey),`water_${form}_settling`));
      }
      add(path('soil',form,k('water_to_soil_y'),'water_to_soil'));
      add(sinkPath(`water_advective.${form}`,k(form==='dissolved'?'water_advective_dissolved_y':'water_advective_particulate_y')));
      if(form!=='unresolved')add(sinkPath(`water_non_nano.${form}`,k('water_non_nano_loss_y')));
    }else if(comp==='soil'){
      if(['free_particle','small_aggregate','dissolved','unresolved'].includes(form))add(path('water',form,k('soil_runoff_to_water_y'),'soil_runoff_to_water'));
      if(['matrix_bound','small_aggregate','large_aggregate','transformed_particle','unresolved'].includes(form))add(path('sediment',form,k('soil_erosion_to_sediment_y'),'soil_erosion_to_sediment'));
      if(['free_particle','small_aggregate','large_aggregate','transformed_particle','unresolved'].includes(form))add(path('air',form,k('soil_to_air_y'),'soil_to_air'));
      if(['matrix_bound','small_aggregate','large_aggregate','transformed_particle','unresolved'].includes(form))add(sinkPath(`soil_irreversible_retention.${form}`,k('soil_irreversible_retention_y')));
      if(form!=='unresolved')add(sinkPath(`soil_non_nano.${form}`,k('soil_non_nano_loss_y')));
    }else if(comp==='sediment'){
      if(form==='dissolved')add(path('water',form,k('sediment_dissolved_exchange_to_water_y'),'sediment_dissolved_exchange_to_water'));
      else add(path('water',form,k('sediment_resuspension_to_water_y'),'sediment_resuspension_to_water'));
      if(form!=='dissolved')add(sinkPath(`sediment_burial.${form}`,k('sediment_burial_y')));
      if(form!=='unresolved')add(sinkPath(`sediment_non_nano.${form}`,k('sediment_non_nano_loss_y')));
    }
    return p;
  }

  function addEmissions(stocks,emissions,factor){COMPARTMENTS.forEach(c=>FORMS.forEach(f=>stocks[c][f]+=Math.max(0,num(emissions?.[c]?.[f]))*factor));}

  function fateStep(stocks,emissions,rates,dt){
    addEmissions(stocks,emissions,dt/2);
    const incoming=zeroStocks(),sinks={},processFluxes={};
    COMPARTMENTS.forEach(c=>FORMS.forEach(f=>{
      const m=Math.max(0,num(stocks[c][f])),paths=pathsFor(c,f,rates),totalRate=paths.reduce((a,x)=>a+x.rate,0);
      if(m<=0||totalRate<=0)return;
      const loss=m*(1-Math.exp(-totalRate*dt));stocks[c][f]-=loss;
      paths.forEach(x=>{
        const q=loss*x.rate/totalRate;
        if(x.kind==='transfer'){incoming[x.targetComp][x.targetForm]+=q;addFlux(processFluxes,x.key,q);}else addFlux(sinks,x.name,q);
      });
    }));
    COMPARTMENTS.forEach(c=>FORMS.forEach(f=>stocks[c][f]+=incoming[c][f]));
    addEmissions(stocks,emissions,dt/2);
    return {stocks,sinks,processFluxes};
  }

  function eventYears(config=state){return String(config.storm?.event_years||'').split(/[;,\s]+/).map(Number).filter(Number.isFinite);}
  function applyStorm(stocks,year,config=state){
    if(!config.storm?.enabled)return {fluxes:{}};
    const years=eventYears(config);if(years.length&&year!=null&&!years.includes(Number(year)))return {fluxes:{}};
    const fluxes={};
    const transferFraction=(source,target,pct,forms,key)=>{
      const q=clamp(num(pct),0,100)/100;
      forms.forEach(f=>{const m=stocks[source][f]*q;stocks[source][f]-=m;stocks[target][f]+=m;addFlux(fluxes,`${key}.${f}`,m);});
    };
    transferFraction('soil','water',config.storm.soil_to_water_pct,['free_particle','small_aggregate','dissolved','unresolved'],'storm_soil_to_water');
    transferFraction('soil','sediment',config.storm.soil_to_sediment_pct,['matrix_bound','small_aggregate','large_aggregate','transformed_particle','unresolved'],'storm_soil_to_sediment');
    transferFraction('sediment','water',config.storm.sediment_to_water_pct,['free_particle','small_aggregate','large_aggregate','dissolved','transformed_particle','unresolved'],'storm_sediment_to_water');
    return {fluxes};
  }

  function simulateYear(stocks,row,config=state){
    const substeps=Math.max(1,Math.round(num(config.substeps_per_year)||12)),sinks={},processFluxes={};
    for(let i=0;i<substeps;i++){
      const step=fateStep(stocks,row.emissions,config.rates,1/substeps);stocks=step.stocks;
      Object.entries(step.sinks).forEach(([k,v])=>addFlux(sinks,k,v));
      Object.entries(step.processFluxes).forEach(([k,v])=>addFlux(processFluxes,k,v));
    }
    const storm=applyStorm(stocks,row.year,config);Object.entries(storm.fluxes).forEach(([k,v])=>addFlux(processFluxes,k,v));
    if(num(row.immediate_non_nano_sink_kg)>0)addFlux(sinks,'input_non_nano_destroyed',row.immediate_non_nano_sink_kg);
    return {stocks,sinks,processFluxes};
  }

  function aggregateByForm(stocks){const o=zeroForms();COMPARTMENTS.forEach(c=>FORMS.forEach(f=>o[f]+=num(stocks[c][f])));return o;}
  function aggregateByCompartment(stocks){return Object.fromEntries(COMPARTMENTS.map(c=>[c,sum(stocks[c])]));}

  function runDynamic(rows,context,config=state){
    let stocks=initialStocks(config);const initialMass=totalStocks(stocks),annual=[];let cumulativeInput=0,cumulativeSinks=0;const allSinks={},allFluxes={};
    const caps=capacities(context.region,context.environment,config);
    for(const row of rows){
      const input=COMPARTMENTS.reduce((a,c)=>a+sum(row.emissions[c]),0)+num(row.immediate_non_nano_sink_kg);
      const sim=simulateYear(stocks,row,config);stocks=sim.stocks;
      const sinkMass=sum(sim.sinks);cumulativeInput+=input;cumulativeSinks+=sinkMass;
      Object.entries(sim.sinks).forEach(([k,v])=>addFlux(allSinks,k,v));Object.entries(sim.processFluxes).forEach(([k,v])=>addFlux(allFluxes,k,v));
      const stockMass=totalStocks(stocks),basis=initialMass+cumulativeInput,accounted=stockMass+cumulativeSinks;
      annual.push({year:row.year,emissions_kg_y:clone(row.emissions),stocks_kg:clone(stocks),stocks_by_compartment_kg:aggregateByCompartment(stocks),stocks_by_form_kg:aggregateByForm(stocks),concentrations:concentrations(stocks,caps),external_sinks_kg_y:sim.sinks,process_fluxes_kg_y:sim.processFluxes,cumulative_input_kg:cumulativeInput,cumulative_external_sinks_kg:cumulativeSinks,mass_balance_residual_kg:basis-accounted,mass_balance_closure_pct:basis>0?accounted/basis*100:100});
    }
    const final=annual.at(-1)||null,basis=initialMass+cumulativeInput,accounted=totalStocks(stocks)+cumulativeSinks;
    return {mode:'dynamic_nanoform_resolved_fate',annual,final,final_stocks_kg:clone(stocks),final_stocks_by_form_kg:aggregateByForm(stocks),final_stocks_by_compartment_kg:aggregateByCompartment(stocks),final_concentrations:concentrations(stocks,caps),capacities:caps,cumulative_external_sinks_kg:allSinks,cumulative_process_fluxes_kg:allFluxes,total_input_kg:cumulativeInput,initial_stock_kg:initialMass,final_stock_kg:totalStocks(stocks),mass_balance_residual_kg:basis-accounted,mass_balance_closure_pct:basis>0?accounted/basis*100:100};
  }

  function runStatic(row,context,config=state){
    let stocks=initialStocks(config);const initialMass=totalStocks(stocks),caps=capacities(context.region,context.environment,config),annual=[];let cumulativeInput=0,cumulativeSinks=0;const allSinks={},allFluxes={};
    const maxYears=Math.max(1,Math.round(num(config.max_static_years)||500)),tol=Math.max(1e-12,num(config.convergence_tolerance)||1e-7);let converged=false;
    for(let y=1;y<=maxYears;y++){
      const before=clone(stocks),sim=simulateYear(stocks,{...row,year:context.baseYear?num(context.baseYear)+y-1:y},config);stocks=sim.stocks;
      const input=COMPARTMENTS.reduce((a,c)=>a+sum(row.emissions[c]),0)+num(row.immediate_non_nano_sink_kg),sinkMass=sum(sim.sinks);cumulativeInput+=input;cumulativeSinks+=sinkMass;
      Object.entries(sim.sinks).forEach(([k,v])=>addFlux(allSinks,k,v));Object.entries(sim.processFluxes).forEach(([k,v])=>addFlux(allFluxes,k,v));
      const after=totalStocks(stocks),delta=COMPARTMENTS.reduce((a,c)=>a+FORMS.reduce((b,f)=>b+Math.abs(num(stocks[c][f])-num(before[c][f])),0),0),rel=delta/Math.max(after,1e-30);
      annual.push({year:y,stocks_by_compartment_kg:aggregateByCompartment(stocks),stock_total_kg:after,relative_stock_change:rel,external_sinks_kg_y:sim.sinks});
      if(rel<=tol){converged=true;break;}
    }
    const basis=initialMass+cumulativeInput,accounted=totalStocks(stocks)+cumulativeSinks;
    return {mode:'steady_state_nanoform_resolved_fate',converged,iterations_years:annual.length,annual,final_stocks_kg:clone(stocks),final_stocks_by_form_kg:aggregateByForm(stocks),final_stocks_by_compartment_kg:aggregateByCompartment(stocks),final_concentrations:concentrations(stocks,caps),capacities:caps,cumulative_external_sinks_kg:allSinks,cumulative_process_fluxes_kg:allFluxes,total_input_kg:cumulativeInput,initial_stock_kg:initialMass,final_stock_kg:totalStocks(stocks),mass_balance_residual_kg:basis-accounted,mass_balance_closure_pct:basis>0?accounted/basis*100:100,steady_state_annual_input_kg:COMPARTMENTS.reduce((a,c)=>a+sum(row.emissions[c]),0)+num(row.immediate_non_nano_sink_kg),last_year_external_sinks_kg:annual.at(-1)?.external_sinks_kg_y||{}};
  }

  function compute(baseResult,nanoformOutput,context,config=state){
    if(!config.enabled||!baseResult)return null;
    let rows=config.external_coupling?.enabled?emissionsFromExternal(config):emissionsFromNanoform(nanoformOutput,config);
    if(!rows.length)return null;
    let out;
    if((baseResult.model==='dynamic'||config.external_coupling?.enabled&&rows.length>1)&&rows.some(r=>r.year!=null))out=runDynamic(rows,context,config);else out=runStatic(rows[0],context,config);
    out.schema='K-NanoMFA-dynamic-nanoform-fate-output-v2';out.version=VERSION;out.configuration=clone(config);
    out.emission_source=config.external_coupling?.enabled?'external_state_resolved_inventory':'K-NanoMFA_v1.5_nanoform_release_output';
    out.scientific_boundary='Dynamic, spatially aggregated first-order nanoform fate screening. Competing transformations and transfers are mass-conserving, but parameter values require case-specific evidence and the results are not a substitute for calibrated hydrodynamic or geochemical models.';
    return out;
  }

  function validate(config=state,nanoformState=null){
    const errors=[],warnings=[];if(!config.enabled)return {errors,warnings};
    if(!config.external_coupling?.enabled&&!nanoformState?.enabled)errors.push('Enable v1.5 nanoform state tracking or import an external state-resolved emission inventory.');
    if(num(config.substeps_per_year)<1||num(config.substeps_per_year)>365)errors.push('Substeps per year must be between 1 and 365.');
    if(num(config.large_fraction_of_aggregated_pct)<0||num(config.large_fraction_of_aggregated_pct)>100)errors.push('The large-aggregate share must remain between 0 and 100%.');
    if(Object.values(config.rates||{}).some(v=>num(v)<0))errors.push('All first-order rate constants must be non-negative.');
    const p=sum(config.initial_profile_pct);if(Math.abs(p-100)>.05)errors.push(`Initial-stock form profile totals ${p.toFixed(3)}%, not 100%.`);
    if(config.external_coupling?.enabled&&!(config.external_coupling.rows||[]).length)errors.push('External coupling is enabled but no state-resolved emission rows are loaded.');
    if(config.evidence_class==='E')warnings.push('Kinetic parameters use expert screening evidence class E.');
    if(num(config.substeps_per_year)<12)warnings.push('Fewer than 12 substeps per year may be coarse for fast aggregation or deposition rates.');
    return {errors,warnings};
  }

  function rateGroup(key){
    if(/dissolution|reprecipitation/.test(key))return 0;
    if(/aggregate|free_to_small|small_to_large|fragmentation|settling/.test(key))return 1;
    if(/to_water|to_soil|to_air|runoff|erosion|resuspension|advective|burial|retention/.test(key))return 2;
    return 3;
  }
  function mulberry32(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
  function normal(rng){const u=Math.max(rng(),1e-12),v=Math.max(rng(),1e-12);return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
  function correlatedNormals(rng,rho){
    rho=clamp(num(rho),-0.32,0.95);const n=4,A=Array.from({length:n},()=>Array(n).fill(0));for(let i=0;i<n;i++)for(let j=0;j<n;j++)A[i][j]=i===j?1:rho;
    const L=Array.from({length:n},()=>Array(n).fill(0));for(let i=0;i<n;i++)for(let j=0;j<=i;j++){let s=A[i][j];for(let k=0;k<j;k++)s-=L[i][k]*L[j][k];L[i][j]=i===j?Math.sqrt(Math.max(s,1e-12)):s/L[j][j];}
    const z=Array.from({length:n},()=>normal(rng));return L.map(row=>row.reduce((a,x,j)=>a+x*z[j],0));
  }
  function quantile(a,q){const x=[...a].sort((m,n)=>m-n);if(!x.length)return null;const p=(x.length-1)*q,i=Math.floor(p),r=p-i;return x[i]+(x[Math.min(i+1,x.length-1)]-x[i])*r;}
  function runUncertainty(baseResult,nanoformOutput,context,config=state){
    if(!config.enabled||!config.uncertainty?.enabled)return null;
    const n=Math.max(10,Math.min(500,Math.round(num(config.uncertainty.iterations)||100))),rng=mulberry32(num(config.uncertainty.seed)||73),cv=Math.max(0,num(config.uncertainty.cv)),sigma=Math.sqrt(Math.log(1+cv*cv));
    const samples={air:[],water:[],soil:[],sediment:[],stock:[],dissolved_share:[],large_aggregate_share:[],closure:[]};
    for(let i=0;i<n;i++){
      const z=correlatedNormals(rng,config.uncertainty.group_correlation),cfg=clone(config);cfg.uncertainty.enabled=false;
      Object.keys(cfg.rates).forEach(k=>{const g=rateGroup(k),mult=Math.exp(sigma*z[g]-0.5*sigma*sigma);cfg.rates[k]=num(cfg.rates[k])*mult;});
      const o=compute(baseResult,nanoformOutput,context,cfg);if(!o)continue;
      COMPARTMENTS.forEach(c=>samples[c].push(o.final_concentrations.total[c]));samples.stock.push(o.final_stock_kg);const forms=o.final_stocks_by_form_kg,tot=Math.max(sum(forms),1e-30);samples.dissolved_share.push(forms.dissolved/tot*100);samples.large_aggregate_share.push(forms.large_aggregate/tot*100);samples.closure.push(o.mass_balance_closure_pct);
    }
    const summary=Object.fromEntries(Object.entries(samples).map(([k,v])=>[k,{P5:quantile(v,.05),P50:quantile(v,.5),P95:quantile(v,.95)}]));
    lastUncertainty={schema:'K-NanoMFA-dynamic-fate-uncertainty-v2',iterations:n,cv,group_correlation:num(config.uncertainty.group_correlation),summary};return clone(lastUncertainty);
  }

  function getState(){return clone(state);}
  function loadState(x){const d=defaultState();state={...d,...clone(x||{})};state.rates={...d.rates,...clone(x?.rates||{})};state.initial_stock_kg={...d.initial_stock_kg,...clone(x?.initial_stock_kg||{})};state.initial_profile_pct={...d.initial_profile_pct,...clone(x?.initial_profile_pct||{})};state.storm={...d.storm,...clone(x?.storm||{})};state.external_coupling={...d.external_coupling,...clone(x?.external_coupling||{})};state.uncertainty={...d.uncertainty,...clone(x?.uncertainty||{})};renderAll();refresh();}
  function getOutputs(){return clone(lastOutput);}
  function getUncertainty(){return clone(lastUncertainty);}
  function clearResult(){lastResult=null;lastNanoform=null;lastOutput=null;lastUncertainty=null;renderResults();}
  function onModelResult(result,context){lastResult=result;lastContext=clone(context||{});lastNanoform=(typeof window!=='undefined'?window.KNanoNanoform?.getOutputs?.():null)||lastNanoform;lastOutput=compute(lastResult,lastNanoform,lastContext,state);lastUncertainty=null;renderResults();return lastOutput;}
  function refresh(){if(app?.state?.result)onModelResult(app.state.result,{environment:app.deepClone(app.state.environment),region:app.deepClone(app.currentRegion()),baseYear:num(app.$('baseYear')?.value),material:app.materialDisplayName()});else renderResults();}

  function parseExternalCsv(text){
    const lines=String(text||'').trim().split(/\r?\n/).filter(Boolean);if(lines.length<2)return [];
    const head=lines[0].split(',').map(x=>x.trim().replace(/^"|"$/g,'').toLowerCase());const idx=n=>head.indexOf(n);
    return lines.slice(1).map(line=>{const a=line.split(',').map(x=>x.trim().replace(/^"|"$/g,''));return {year:num(a[idx('year')]),compartment:a[idx('compartment')]||a[idx('medium')],form:a[idx('form')]||a[idx('state')],mass_kg_y:num(a[idx('mass_kg_y')])};}).filter(r=>r.year&&COMPARTMENTS.includes(String(r.compartment).toLowerCase())&&FORMS.includes(String(r.form).toLowerCase())&&r.mass_kg_y>=0);
  }

  function couplingCsv(){
    const rows=['year,compartment,form,mass_kg_y'];
    const source=state.external_coupling?.enabled?emissionsFromExternal(state):emissionsFromNanoform((typeof window!=='undefined'?window.KNanoNanoform?.getOutputs?.():lastNanoform),state);
    source.forEach((row,i)=>COMPARTMENTS.forEach(c=>FORMS.forEach(f=>rows.push(`${row.year??i+1},${c},${f},${num(row.emissions[c][f])}`))));return rows.join('\n');
  }
  function resultCsv(){
    if(!lastOutput)return '';
    const rows=['section,year,compartment,form,value,unit'];
    COMPARTMENTS.forEach(c=>FORMS.forEach(f=>rows.push(`final_stock,,${c},${f},${num(lastOutput.final_stocks_kg[c][f])},kg`)));
    lastOutput.final_concentrations.rows.forEach(r=>rows.push(`final_PEC,,${r.compartment},${r.form},${r.value},${r.unit}`));
    (lastOutput.annual||[]).forEach(r=>COMPARTMENTS.forEach(c=>rows.push(`annual_stock,${r.year},${c},,${num(r.stocks_by_compartment_kg?.[c])},kg`)));
    Object.entries(lastOutput.cumulative_external_sinks_kg||{}).forEach(([k,v])=>rows.push(`external_sink,,,${k},${v},kg`));return rows.join('\n');
  }

  const $=id=>typeof document!=='undefined'?document.getElementById(id):null;
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fmt=(v,d=6)=>Number.isFinite(Number(v))?Number(v).toLocaleString(undefined,{maximumFractionDigits:d}):'—';
  function makeTable(headers,rows){return `<table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}

  function renderRateTable(){const el=$('dynamicFateRateTable');if(!el)return;el.innerHTML=makeTable(['Process','First-order rate (y⁻¹)'],Object.keys(RATE_LABELS).map(k=>[RATE_LABELS[k],`<input type="number" min="0" step="0.001" value="${num(state.rates[k])}" data-df-rate="${k}">`]));el.querySelectorAll('[data-df-rate]').forEach(x=>x.addEventListener('change',()=>{state.rates[x.dataset.dfRate]=Math.max(0,num(x.value));state.preset='custom';if($('dynamicFatePreset'))$('dynamicFatePreset').value='custom';refresh();app?.validate?.();}));}
  function renderInitialProfile(){const el=$('dynamicFateInitialProfileTable');if(!el)return;const total=sum(state.initial_profile_pct);el.innerHTML=makeTable(['Initial-stock form','Allocation (%)'],[...FORMS.map(f=>[FORM_LABELS[f],`<input type="number" min="0" max="100" step="0.1" value="${num(state.initial_profile_pct[f])}" data-df-profile="${f}">`]),['<b>Total</b>',`<b class="${Math.abs(total-100)<.05?'sum-ok':'sum-bad'}">${fmt(total,3)}%</b>`]]);el.querySelectorAll('[data-df-profile]').forEach(x=>x.addEventListener('change',()=>{state.initial_profile_pct[x.dataset.dfProfile]=num(x.value);renderInitialProfile();refresh();app?.validate?.();}));}
  function renderStatus(){const box=$('dynamicFateStatus');if(!box)return;const nf=typeof window!=='undefined'?window.KNanoNanoform?.getState?.():null,v=validate(state,nf);box.className=`notice dynamic-fate-status ${v.errors.length?'validation bad':'validation ok'}`;box.innerHTML=state.enabled?`<b>Dynamic nanoform fate is enabled.</b> ${v.errors.length?esc(v.errors.join(' ')):'The kinetic state-transition engine is ready.'}${v.warnings.length?`<span>${esc(v.warnings.join(' '))}</span>`:''}`:'<b>Legacy-compatible mode.</b> The v2.0 dynamic fate engine is disabled; v1.5 outputs remain unchanged.';}
  function renderConfig(){
    if($('dynamicFateEnabled'))$('dynamicFateEnabled').checked=Boolean(state.enabled);if($('dynamicFateDetails'))$('dynamicFateDetails').hidden=!state.enabled;
    if($('dynamicFatePreset'))$('dynamicFatePreset').value=state.preset;if($('dynamicFateSubsteps'))$('dynamicFateSubsteps').value=state.substeps_per_year;if($('dynamicFateWaterResidence'))$('dynamicFateWaterResidence').value=state.water_residence_time_days;if($('dynamicFateLargeAgg'))$('dynamicFateLargeAgg').value=state.large_fraction_of_aggregated_pct;
    if($('dynamicFateMaxYears'))$('dynamicFateMaxYears').value=state.max_static_years;if($('dynamicFateTolerance'))$('dynamicFateTolerance').value=state.convergence_tolerance;if($('dynamicFateEvidenceClass'))$('dynamicFateEvidenceClass').value=state.evidence_class;if($('dynamicFateSourceNote'))$('dynamicFateSourceNote').value=state.source_note||'';if($('dynamicFateLimitations'))$('dynamicFateLimitations').value=state.limitations||'';
    COMPARTMENTS.forEach(c=>{if($(`dynamicFateInitial_${c}`))$(`dynamicFateInitial_${c}`).value=num(state.initial_stock_kg[c]);});
    if($('dynamicFateStormEnabled'))$('dynamicFateStormEnabled').checked=Boolean(state.storm.enabled);if($('dynamicFateStormYears'))$('dynamicFateStormYears').value=state.storm.event_years||'';if($('dynamicFateStormWater'))$('dynamicFateStormWater').value=state.storm.soil_to_water_pct;if($('dynamicFateStormSediment'))$('dynamicFateStormSediment').value=state.storm.soil_to_sediment_pct;if($('dynamicFateStormResuspension'))$('dynamicFateStormResuspension').value=state.storm.sediment_to_water_pct;
    if($('dynamicFateExternalEnabled'))$('dynamicFateExternalEnabled').checked=Boolean(state.external_coupling.enabled);if($('dynamicFateExternalStatus'))$('dynamicFateExternalStatus').textContent=state.external_coupling.rows.length?`${state.external_coupling.rows.length} external emission rows loaded.`:'No external emission inventory loaded.';
    if($('dynamicFateUncertaintyEnabled'))$('dynamicFateUncertaintyEnabled').checked=Boolean(state.uncertainty.enabled);if($('dynamicFateIterations'))$('dynamicFateIterations').value=state.uncertainty.iterations;if($('dynamicFateSeed'))$('dynamicFateSeed').value=state.uncertainty.seed;if($('dynamicFateCv'))$('dynamicFateCv').value=state.uncertainty.cv;if($('dynamicFateCorrelation'))$('dynamicFateCorrelation').value=state.uncertainty.group_correlation;
    renderRateTable();renderInitialProfile();renderStatus();
  }

  function dominant(obj,keys){return keys.reduce((a,k)=>num(obj[k])>num(obj[a])?k:a,keys[0]);}
  function renderUncertainty(){const box=$('dynamicFateUncertaintyResults');if(!box)return;if(!lastUncertainty){box.innerHTML='';return;}const s=lastUncertainty.summary;box.innerHTML=makeTable(['Metric','P5','P50','P95'],[
    ['Air PEC (ng/m³)',fmt(s.air.P5,8),fmt(s.air.P50,8),fmt(s.air.P95,8)],['Water PEC (µg/L)',fmt(s.water.P5,8),fmt(s.water.P50,8),fmt(s.water.P95,8)],['Soil PEC (µg/kg)',fmt(s.soil.P5,8),fmt(s.soil.P50,8),fmt(s.soil.P95,8)],['Sediment PEC (µg/kg)',fmt(s.sediment.P5,8),fmt(s.sediment.P50,8),fmt(s.sediment.P95,8)],['Final active stock (kg)',fmt(s.stock.P5,6),fmt(s.stock.P50,6),fmt(s.stock.P95,6)],['Dissolved share (%)',fmt(s.dissolved_share.P5,4),fmt(s.dissolved_share.P50,4),fmt(s.dissolved_share.P95,4)]
  ]);}
  function renderResults(){
    const panel=$('dynamicFateResultsPanel');if(!panel)return;panel.hidden=false;const empty=$('dynamicFateResultsEmpty'),body=$('dynamicFateResultsBody');
    if(!state.enabled){if(empty){empty.hidden=false;empty.innerHTML='<b>Dynamic nanoform fate is disabled.</b> Enable it under Advanced MFA and fate.';}if(body)body.hidden=true;return;}
    if(!lastOutput){if(empty){empty.hidden=false;empty.textContent='Run the MFA model to calculate dynamic nanoform-resolved fate.';}if(body)body.hidden=true;return;}
    if(empty)empty.hidden=true;if(body)body.hidden=false;
    const o=lastOutput,domC=dominant(o.final_stocks_by_compartment_kg,COMPARTMENTS),domF=dominant(o.final_stocks_by_form_kg,FORMS);
    if($('dynamicFateKpis'))$('dynamicFateKpis').innerHTML=`<div class="kpi"><span>Fate mass-balance closure</span><b>${fmt(o.mass_balance_closure_pct,8)}%</b></div><div class="kpi"><span>Final active stock</span><b>${fmt(o.final_stock_kg,6)} kg</b></div><div class="kpi"><span>Dominant compartment</span><b>${esc(COMPARTMENT_LABELS[domC])}</b></div><div class="kpi"><span>Dominant form</span><b>${esc(FORM_LABELS[domF])}</b></div>`;
    if(typeof Plotly!=='undefined'&&$('dynamicFateStockChart')){
      const annual=o.annual||[],x=annual.map((r,i)=>r.year??i+1);Plotly.react('dynamicFateStockChart',COMPARTMENTS.map(c=>({type:'scatter',mode:'lines',name:COMPARTMENT_LABELS[c],x,y:annual.map(r=>num(r.stocks_by_compartment_kg?.[c]))})),{margin:{l:70,r:20,t:20,b:55},xaxis:{title:o.mode.startsWith('steady')?'Iteration year':'Calendar year',automargin:true},yaxis:{title:'Active stock (kg)',automargin:true},legend:{orientation:'h'},paper_bgcolor:'transparent',plot_bgcolor:'transparent'},{responsive:true,displaylogo:false});
    }
    if($('dynamicFateMatrixTable'))$('dynamicFateMatrixTable').innerHTML=makeTable(['Compartment',...FORMS.map(f=>FORM_LABELS[f]),'Total'],COMPARTMENTS.map(c=>[COMPARTMENT_LABELS[c],...FORMS.map(f=>fmt(o.final_stocks_kg[c][f],7)),fmt(sum(o.final_stocks_kg[c]),7)]));
    if($('dynamicFatePecTable'))$('dynamicFatePecTable').innerHTML=makeTable(['Compartment','Form','State-specific PEC','Unit'],o.final_concentrations.rows.map(r=>[COMPARTMENT_LABELS[r.compartment],FORM_LABELS[r.form],fmt(r.value,10),r.unit]));
    if($('dynamicFateSinkTable'))$('dynamicFateSinkTable').innerHTML=makeTable(['External sink','Cumulative mass (kg)'],Object.entries(o.cumulative_external_sinks_kg||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[k.replaceAll('_',' ').replaceAll('.',' — '),fmt(v,8)]));
    if($('dynamicFateAnnualTable'))$('dynamicFateAnnualTable').innerHTML=makeTable(['Year','Air stock','Water stock','Soil stock','Sediment stock','Closure (%)'],(o.annual||[]).map((r,i)=>[r.year??i+1,...COMPARTMENTS.map(c=>fmt(r.stocks_by_compartment_kg?.[c],7)),fmt(r.mass_balance_closure_pct??o.mass_balance_closure_pct,8)]));
    if($('dynamicFateResultNote'))$('dynamicFateResultNote').textContent=o.scientific_boundary;renderUncertainty();
  }
  function renderAll(){if(typeof document==='undefined')return;renderConfig();renderResults();}

  function initUI(application){
    if(initialized||typeof document==='undefined')return;initialized=true;app=application||(typeof window!=='undefined'?window.KNanoApp:null)||null;
    const preset=$('dynamicFatePreset');if(preset)preset.innerHTML=Object.entries(PRESETS).map(([k,v])=>`<option value="${k}">${esc(v.label)}</option>`).join('');
    $('dynamicFateEnabled')?.addEventListener('change',e=>{state.enabled=e.target.checked;renderAll();refresh();app?.validate?.();});
    preset?.addEventListener('change',e=>state.preset=e.target.value);$('applyDynamicFatePresetBtn')?.addEventListener('click',()=>{applyPreset(preset?.value);app?.validate?.();});$('resetDynamicFateBtn')?.addEventListener('click',()=>{state=defaultState();lastUncertainty=null;renderAll();refresh();app?.validate?.();});
    const bindNum=(id,setter)=>$(id)?.addEventListener('change',e=>{setter(num(e.target.value));refresh();app?.validate?.();});
    bindNum('dynamicFateSubsteps',v=>state.substeps_per_year=v);bindNum('dynamicFateWaterResidence',v=>state.water_residence_time_days=v);bindNum('dynamicFateLargeAgg',v=>state.large_fraction_of_aggregated_pct=v);bindNum('dynamicFateMaxYears',v=>state.max_static_years=v);bindNum('dynamicFateTolerance',v=>state.convergence_tolerance=v);
    COMPARTMENTS.forEach(c=>bindNum(`dynamicFateInitial_${c}`,v=>state.initial_stock_kg[c]=v));
    $('dynamicFateEvidenceClass')?.addEventListener('change',e=>{state.evidence_class=e.target.value;renderStatus();});$('dynamicFateSourceNote')?.addEventListener('change',e=>state.source_note=e.target.value);$('dynamicFateLimitations')?.addEventListener('change',e=>state.limitations=e.target.value);
    $('dynamicFateStormEnabled')?.addEventListener('change',e=>{state.storm.enabled=e.target.checked;refresh();});$('dynamicFateStormYears')?.addEventListener('change',e=>state.storm.event_years=e.target.value);bindNum('dynamicFateStormWater',v=>state.storm.soil_to_water_pct=v);bindNum('dynamicFateStormSediment',v=>state.storm.soil_to_sediment_pct=v);bindNum('dynamicFateStormResuspension',v=>state.storm.sediment_to_water_pct=v);
    $('dynamicFateExternalEnabled')?.addEventListener('change',e=>{state.external_coupling.enabled=e.target.checked;renderStatus();refresh();app?.validate?.();});$('importDynamicFateCsv')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{state.external_coupling.rows=parseExternalCsv(r.result);state.external_coupling.source_note=f.name;renderConfig();refresh();app?.validate?.();};r.readAsText(f);});
    $('downloadDynamicFateTemplateBtn')?.addEventListener('click',()=>app?.download?.('K-NanoMFA_dynamic_fate_coupling_template_v20.csv',couplingCsv(),'text/csv;charset=utf-8'));
    $('downloadDynamicFateCsvBtn')?.addEventListener('click',()=>{if(!lastOutput){alert('Run the model with dynamic nanoform fate enabled before exporting.');return;}app?.download?.('K-NanoMFA_dynamic_nanoform_fate_v20.csv',resultCsv(),'text/csv;charset=utf-8');});
    $('dynamicFateUncertaintyEnabled')?.addEventListener('change',e=>state.uncertainty.enabled=e.target.checked);bindNum('dynamicFateIterations',v=>state.uncertainty.iterations=v);bindNum('dynamicFateSeed',v=>state.uncertainty.seed=v);bindNum('dynamicFateCv',v=>state.uncertainty.cv=v);bindNum('dynamicFateCorrelation',v=>state.uncertainty.group_correlation=v);
    $('runDynamicFateUncertaintyBtn')?.addEventListener('click',()=>{if(!lastResult||!lastOutput){alert('Run the MFA and dynamic fate model first.');return;}runUncertainty(lastResult,lastNanoform,lastContext,state);renderUncertainty();});
    renderAll();refresh();
  }

  return {VERSION,COMPARTMENTS,FORMS,COMPARTMENT_LABELS,FORM_LABELS,RATE_LABELS,PRESETS,defaultState,applyPreset,capacities,concentrations,mapNanoformMedium,emissionsFromNanoform,emissionsFromExternal,initialStocks,pathsFor,fateStep,applyStorm,simulateYear,runDynamic,runStatic,compute,validate,runUncertainty,parseExternalCsv,couplingCsv,resultCsv,getState,loadState,getOutputs,getUncertainty,clearResult,onModelResult,refresh,initUI};
});
