'use client';
import * as React from 'react';
import dynamic from 'next/dynamic';
import type { Template } from 'tinacms';
import { PageBlocksVideo } from '@/tina/__generated__/types';
import { Section, sectionBlockSchemaField } from '@/components/layout/section';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export const Video = ({ data }: { data: PageBlocksVideo }) => {
  if (!data.url) {
    return null;
  }
  return (
    <Section background={data.background!} className={`aspect-video ${data.color}`}>
      <ReactPlayer width='100%' height='100%' style={{ margin: 'auto' }} playing={!!data.autoPlay} loop={!!data.loop} controls={true} url={data.url} />
    </Section>
  );
};

export const videoBlockSchema: Template = {
  name: 'video',
  label: 'Видео',
  ui: {
    previewSrc: '/blocks/video.png',
    defaultItem: {
      url: 'https://www.youtube.com/watch?v=j8egYW7Jpgk',
    },
  },
  fields: [
    sectionBlockSchemaField as any,
    {
      type: 'string',
      label: 'Цвет',
      name: 'color',
      options: [
        { label: 'По умолчанию', value: 'default' },
        { label: 'Оттенок', value: 'tint' },
        { label: 'Основной', value: 'primary' },
      ],
    },
    {
      type: 'string',
      label: 'Ссылка',
      name: 'url',
    },
    {
      type: 'boolean',
      label: 'Автовоспроизведение',
      name: 'autoPlay',
    },
    {
      type: 'boolean',
      label: 'Зацикливание',
      name: 'loop',
    },
  ],
};
