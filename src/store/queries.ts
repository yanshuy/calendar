import { SQLocal } from "sqlocal";
import { timeZone } from "../utils/timeZone.";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { CalendarEvent, categories, DBCalendarEvent } from "./schema";

export class Querier {
  db: SQLocal

  constructor(db: SQLocal) {
    this.db = db
  }

  async getAll() {
    let events = await this.db.sql`SELECT * FROM calendar_events`
    events = events.map(e => {
      toZonedTime(e.startDateTime, timeZone)
      toZonedTime(e.endDateTime, timeZone)
      return e
    })
    return events as CalendarEvent[]
  }

  async insert(event: DBCalendarEvent) {
    let startDateTime = fromZonedTime(event.startDateTime, timeZone)
    let endDateTime = fromZonedTime(event.endDateTime, timeZone)
    let category = event.category ? event.category : categories[1]

    return this.db.sql`INSERT INTO calendar_events VALUES (${event.title}, ${event.description}, ${startDateTime}, ${endDateTime}, ${event.eventStatus}, ${category})`
  }

  async update(event: CalendarEvent) {
    let startDateTime = fromZonedTime(event.startDateTime, timeZone)
    let endDateTime = fromZonedTime(event.endDateTime, timeZone)
    return this.db.sql`UPDATE calendar_events SET title = ${event.title}, description = ${event.description}, start_date_time = ${startDateTime}, end_date_time = ${endDateTime}, event_status = ${event.eventStatus}, category = ${event.category} WHERE id = ${event.id}`
  }
}
