import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
import NavBar from "../../components/NavBar";
import Spacer from "../../components/Spacer";

export function LegalDocument({ data }) {
  const { title, lastUpdated, definitions, sections } = data;

  return <div className="container">
    <Helmet>
      <title>{title}</title>
    </Helmet>
    <NavBar title={title} />
    <div className="content">
      <Spacer y={9} />
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
      <Spacer y={9} />
    </div>
  </div>
}
