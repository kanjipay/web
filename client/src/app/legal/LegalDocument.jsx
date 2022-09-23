import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
import Content from "../../components/layout/Content";
import Spacer from "../../components/Spacer";
import { Container } from "../brand/FAQsPage";

export function LegalDocument({ data }) {
  const { title, definitions, sections, version } = data;

  const [year, month, day] = version.split(".").map(x => parseInt(x, 10))
  const lastUpdated = new Date(year, month - 1, day)

  return <Container maxWidth={800}>
    <Helmet>
      <title>{title}</title>
    </Helmet>
    
    <Content>
      <h1 className="header-l">{title}</h1>
      <Spacer y={2} />
      <p className="text-body-faded">Last updated {format(lastUpdated, "do MMM yyyy")}</p>
      <Spacer y={4} />
      <h2 className="header-m">Definitions</h2>
      <Spacer y={2} />
      {
        definitions.map((definition, index) => <div key={index}>
          <h4 className="header-xs">{definition.title}</h4>
          <Spacer y={1} />
          <p>{definition.description}</p>
          <Spacer y={2} />
        </div>)
      }
      <Spacer y={2} />
      {sections.map((section, sectionIndex) => <div key={sectionIndex}>
        <h2 className="header-m">{sectionIndex + 1} - {section.title}</h2>
        <Spacer y={2} />
        {section.clauses.map((clause, clauseIndex) => <div key={`${sectionIndex}.${clauseIndex}`}>
          <p className="text-body">{sectionIndex + 1}.{clauseIndex + 1} - {clause}</p>
          <Spacer y={2} />
        </div>)}
        <Spacer y={2} />
      </div>)}
    </Content>
  </Container>
}
