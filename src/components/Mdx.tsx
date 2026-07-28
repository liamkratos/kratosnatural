import {MDXRemote} from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import {Link} from '@/i18n/navigation';

/**
 * Components available inside MDX articles. Internal links go through the
 * locale-aware Link so they respect domain routing; external links open safely.
 */
const components = {
  a: ({href = '', ...props}: React.ComponentProps<'a'>) => {
    if (href.startsWith('/')) {
      return <Link href={href} {...props} />;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    );
  }
};

export default function Mdx({source}: {source: string}) {
  return (
    <div className="prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-kratos-700">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug]
          }
        }}
      />
    </div>
  );
}
