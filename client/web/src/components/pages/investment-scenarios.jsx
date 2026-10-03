import { industryScenarioLayouts } from '@/lib/pages/explanation-layouts';
import { Html, Icon } from './content-primitives';
export function isInvestmentScenarios(page, section) {
    return page.type === 'industry' && industryScenarioLayouts[`${page.locale}/${page.id}`] === section.id;
}
const icons = {
    'a-new-processing-unit': 'factory', 'नई-प्रोसेसिंग-यूनिट': 'factory',
    'expansion-of-an-operating-mill-or-plant': 'chart-line-up', 'चल-रही-मिल-या-प्लांट-का-विस्तार': 'chart-line-up',
    'a-targeted-equipment-requirement': 'target', 'किसी-खास-उपकरण-की-ज़रूरत': 'target',
};
export function InvestmentScenarios({ section, t }) {
    const blocks = [...section.html.matchAll(/(<h3\b[^>]*>[\s\S]*?<\/h3>)([\s\S]*?)(?=<h3\b|$)/g)];
    return <div className="investment-scenarios" data-component="InvestmentScenarios">{blocks.map(([full, heading, body]) => {
            const id = heading.match(/id="([^"]+)"/)?.[1] || heading;
            const paragraphs = [...body.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/g)].map(m => m[0]);
            return <article className="investment-scenario" key={id}>
   <header><Icon name={icons[id] || 'target'}/><Html html={heading}/></header>
   <div className={`scenario-panels ${paragraphs.length > 1 ? 'scenario-pair' : ''}`}>
    {paragraphs.length > 1 ? <><div><p className="scenario-label">{t('site.scenarios.yourProject')}</p><Html html={paragraphs[0]}/></div><div className="scenario-support"><p className="scenario-label">{t('site.scenarios.howRapidHelps')}</p><Html html={paragraphs.slice(1).join('\n')}/></div></> : <div><Html html={body}/></div>}
   </div>
  </article>;
        })}</div>;
}
