import type { Route } from "./+types/projects";
import { Icon } from "~/components/icons";
import { ArrowLink, Container, DraftBanner, PageHero, Prose, Section } from "~/components/Page";
import { getCommunitySummaries, getProjects, type Project } from "~/content";
import { pageMeta } from "~/lib/meta";
import { projectsLd } from "~/lib/seo";

export function loader() {
  const doc = getProjects();
  // One group per community, in the site-wide order (GDG Ilorin first); empty groups are skipped.
  const groups = getCommunitySummaries()
    .map((community) => ({ community, projects: doc.projects.filter((p) => p.community === community.slug) }))
    .filter((g) => g.projects.length > 0);
  return { doc, groups };
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  pageMeta({
    title: loaderData.doc.title,
    description: loaderData.doc.summary,
    path: "/projects",
    crumbs: [{ name: loaderData.doc.title, path: "/projects" }],
    jsonLd: [projectsLd(loaderData.doc.projects, loaderData.groups.map((g) => g.community))],
  });

const linkLabel = (url: string) =>
  url.includes("figma.com") ? "Open in Figma" : url.includes("github.com") ? "View on GitHub" : "Visit";

function ProjectCard({ project }: { project: Project }) {
  return (
    <li className="rise-in flex w-full flex-col rounded-[var(--radius-card)] bg-panel p-6 sm:w-[calc(50%-0.5rem)] sm:p-8 lg:w-[calc((100%-2rem)/3)]">
      <p className="w-fit rounded-full bg-page px-3 py-1 text-xs font-medium text-muted">{project.type}</p>
      <h3 className="mt-5 font-serif text-[1.75rem] leading-[1.1] tracking-[-0.03em] text-ink">{project.name}</h3>
      <p className="mt-3 text-muted">{project.summary}</p>
      {(project.stats || project.credit || project.license) && (
        <dl className="mt-5 space-y-1 text-sm">
          {project.stats && (
            <div>
              <dt className="sr-only">Usage</dt>
              <dd className="font-medium text-ink">{project.stats}</dd>
            </div>
          )}
          {project.credit && (
            <div>
              <dt className="sr-only">Made by</dt>
              <dd className="text-muted">{project.credit}</dd>
            </div>
          )}
          {project.license && (
            <div>
              <dt className="sr-only">License</dt>
              <dd className="text-muted">Free under {project.license}</dd>
            </div>
          )}
        </dl>
      )}
      <a
        href={project.url}
        className="mt-auto inline-flex w-fit items-center gap-1.5 pt-6 font-medium text-accent underline decoration-1 underline-offset-4"
      >
        {linkLabel(project.url)}
        <span className="sr-only">: {project.name}</span>
        <Icon name="arrowRightUp" className="size-4" />
      </a>
    </li>
  );
}

export default function Projects({ loaderData }: Route.ComponentProps) {
  const { doc, groups } = loaderData;
  return (
    <>
      <PageHero title={doc.title} lede={doc.summary} />
      <DraftBanner show={!doc.publish} />
      <Prose html={doc.html} />

      {groups.map(({ community, projects }) => (
        <Section key={community.slug} id={community.slug} title={community.title}>
          <Container>
            {/* Wrapping flex rather than a grid, so a short last row (or a lone card) sits centred. */}
            <ul className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.url} project={project} />
              ))}
            </ul>
            {community.route && (
              <p className="mt-10 text-center">
                <ArrowLink href={community.route}>More about {community.title}</ArrowLink>
              </p>
            )}
          </Container>
        </Section>
      ))}
    </>
  );
}
