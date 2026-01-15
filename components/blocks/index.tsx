import { tinaField } from "tinacms/dist/react";
import { Page, PageBlocks } from "@/tina/__generated__/types";
import { Hero } from "./hero";
import { Marquee } from "./marquee";
import { Content } from "./content";
import { About } from "./about";
import { Advantages } from "./advantages";
import { Pricing } from "./pricing";
import { Faq } from "./faq";

export const Blocks = (props: Omit<Page, "id" | "_sys" | "_values">) => {
  if (!props.blocks) return null;
  return (
    <>
      {props.blocks.map(function (block, i) {
        return (
          <div key={i} data-tina-field={tinaField(block)}>
            <Block {...block} />
          </div>
        );
      })}
    </>
  );
};

const Block = (block: PageBlocks) => {
  switch (block.__typename) {
    case "PageBlocksHero":
      return <Hero data={block} />;
    case "PageBlocksMarquee":
      return <Marquee data={block} />;
    case "PageBlocksContent":
      return <Content data={block} />;
    case "PageBlocksAbout":
      return <About data={block} />;
    case "PageBlocksAdvantages":
      return <Advantages data={block} />;
    case "PageBlocksPricing":
      return <Pricing data={block} />;
    case "PageBlocksFaq":
      return <Faq data={block} />;
    default:
      return null;
  }
};
