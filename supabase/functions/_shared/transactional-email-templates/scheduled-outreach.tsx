import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  subject?: string
  body?: string
  recipientName?: string | null
  senderName?: string | null
}

// Generic carrier template for queued/scheduled workspace emails. The subject
// and body are authored by the customer inside the workspace; this template only
// renders them safely (React escapes props — never dangerouslySetInnerHTML).
const Email = ({ subject, body, recipientName, senderName }: Props) => {
  const paragraphs = String(body ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{subject || 'A scheduled message from Velocity Vision'}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{subject || 'Scheduled message'}</Heading>
          {recipientName ? <Text style={text}>Hi {recipientName},</Text> : null}
          <Section>
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <Text key={i} style={text}>
                  {p.split('\n').map((line, j) => (
                    <React.Fragment key={j}>
                      {j > 0 ? <br /> : null}
                      {line}
                    </React.Fragment>
                  ))}
                </Text>
              ))
            ) : (
              <Text style={text}>{body}</Text>
            )}
          </Section>
          {senderName ? <Text style={muted}>Sent by {senderName}</Text> : null}
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (data: Props) => data?.subject || 'A scheduled message from Velocity Vision',
  displayName: 'Scheduled workspace email',
  previewData: {
    subject: 'Following up on your enquiry',
    body: 'Hi there,\n\nJust following up on the notes we shared last week.\n\nBest,\nVelocity Vision',
    recipientName: 'Jane',
    senderName: 'Velocity Vision',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '600px' }
const heading = { fontSize: '20px', color: '#0b1020', margin: '0 0 16px' }
const text = { fontSize: '15px', lineHeight: '24px', color: '#1f2937', margin: '0 0 14px' }
const muted = { fontSize: '13px', lineHeight: '20px', color: '#6b7280', marginTop: '20px' }
