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
  email?: string
  company?: string
  topic?: string
  message?: string
  leadId?: string
}

const row = (label: string, value?: string) =>
  value ? (
    <Text key={label} style={line}>
      <span style={labelStyle}>{label}: </span>
      {value}
    </Text>
  ) : null

const Email = ({ name, email, company, topic, message, leadId }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New website enquiry{name ? ` from ${name}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>New website enquiry</Heading>
        {row('Topic', topic)}
        {row('Name', name)}
        {row('Email', email)}
        {row('Company', company)}
        {row('Lead ID', leadId)}
        <Hr style={hr} />
        <Section style={quote}>
          <Text style={quoteText}>{message || '(no message)'}</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Props) => `[${data?.topic || 'Enquiry'}] Website enquiry — ${data?.name || 'Unknown'}`,
  displayName: 'Contact form notification (internal)',
  previewData: {
    name: 'Jane Doe',
    email: 'jane@acme.com',
    company: 'Acme',
    topic: 'General support',
    message: 'Interested in agency workspaces.',
    leadId: '43dc1b29',
  },
  to: Deno.env.get('CONTACT_NOTIFY_TO') || undefined,
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '28px 24px', maxWidth: '600px' }
const heading = { fontSize: '20px', color: '#0b1220', margin: '0 0 16px' }
const line = { fontSize: '14px', color: '#374151', margin: '0 0 6px' }
const labelStyle = { color: '#6b7280' }
const hr = { borderColor: '#e5e7eb', margin: '18px 0' }
const quote = { backgroundColor: '#f7f7f7', borderRadius: '6px', padding: '12px 14px' }
const quoteText = { fontSize: '14px', color: '#111827', whiteSpace: 'pre-wrap' as const, margin: '0' }
