import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  message?: string
  topic?: string
}

const Email = ({ name, message, topic }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We've received your message — Velocity Vision</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Velocity Vision</Text>
        <Heading style={heading}>Thanks{name ? `, ${name}` : ''} — we've got your message</Heading>
        <Text style={text}>
          Our team normally acknowledges enquiries within one business day.
        </Text>
        {topic ? <Text style={meta}>Topic: {topic}</Text> : null}
        {message ? (
          <Section style={quote}>
            <Text style={quoteText}>{message}</Text>
          </Section>
        ) : null}
        <Hr style={hr} />
        <Text style={footer}>
          Velocity Vision · Global Solutions Management LLC · velocity-outreach.com
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: "We've received your message — Velocity Vision",
  displayName: 'Contact form confirmation',
  previewData: {
    name: 'Jane',
    message: 'Could you tell me more about agency workspaces?',
    topic: 'General support',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const brand = { color: '#1d4ed8', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, margin: '0 0 16px' }
const heading = { fontSize: '24px', lineHeight: '1.3', color: '#0b1220', margin: '0 0 14px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 12px' }
const meta = { fontSize: '13px', color: '#6b7280', margin: '0 0 12px' }
const quote = { backgroundColor: '#f5f7fb', borderLeft: '4px solid #1d4ed8', borderRadius: '8px', padding: '14px 16px', margin: '0 0 20px' }
const quoteText = { fontSize: '14px', color: '#374151', whiteSpace: 'pre-wrap' as const, margin: '0' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0 16px' }
const footer = { fontSize: '12px', color: '#9ca3af', margin: '0' }
