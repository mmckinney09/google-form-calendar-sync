function onFormSubmit(e) {
  const responses = e.values;
  Logger.log("Form submitted: " + JSON.stringify(responses));
  createCalendarEvent(responses);
}

function createCalendarEvent(responses) {
  const email = responses[1];
  const schoolName = responses[2];
  const cartNumber = responses[3];
  const teacherName = responses[4];
  const roomNumber = responses[5];
  const dateOfRequest = responses[6];
  const startTimeStr = responses[7];
  const endTimeStr = responses[8];
  const purpose = responses[9];
  const ipadCount = responses[10];
  const schoolShortName = getSchoolShortName(schoolName);
  const cartFormatted = cartNumber.replace(" ", "-");
  const calendarName = `${schoolShortName}-iPad-${cartFormatted}`;
  const calendar = CalendarApp.getCalendarsByName(calendarName)[0];

  if (!calendar) {
    Logger.log(`Calendar not found: ${calendarName}`);
    return;
  }

  const startDateTime = new Date(`${dateOfRequest} ${startTimeStr}`);
  const endDateTime = new Date(`${dateOfRequest} ${endTimeStr}`);

  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    Logger.log("Invalid date/time format.");
    return;
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const events = calendar.getEvents(startDateTime, endDateTime);
    if (events.length > 0) {
      const conflictEventId = events[0].getId();
      Logger.log(`Conflict detected for ${calendarName} between ${startDateTime} and ${endDateTime}`);
      logConflict(responses, conflictEventId);
      sendConflictEmail(email, calendarName, startDateTime, endDateTime, conflictEventId);
      return;
    }

    const title = `iPad Cart Request - ${teacherName}`;
    const description = `Room: ${roomNumber}\nPurpose: ${purpose}\nNumber of iPads: ${ipadCount}\nRequested by: ${email}`;
    const event = calendar.createEvent(title, startDateTime, endDateTime, { description });
    Logger.log(`Event created with ID: ${event.getId()}`);
  } catch (e) {
    Logger.log("Could not obtain lock: " + e);
  } finally {
    lock.releaseLock();
  }
}

function getSchoolShortName(fullName) {
  // UPDATE THIS MAP TO MATCH YOUR ACTUAL SCHOOLS & SHORT CODES
  const map = {
    "School A": "SCH_A",
    "School B": "SCH_B",
    "School C": "SCH_C",
    "School D": "SCH_D"
  };
  return map[fullName] || fullName;
}

function logConflict(responses, eventId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Conflicts");
  if (!sheet) {
    sheet = ss.insertSheet("Conflicts");
    sheet.appendRow(["Timestamp", "Email", "School", "Cart", "Teacher", "Room", "Date", "Start", "End", "Purpose", "iPads", "Conflicting Event ID"]);
  }
  const row = [...responses, eventId];
  sheet.appendRow(row);
}

function sendConflictEmail(email, calendarName, start, end, eventId) {
  const subject = "iPad Cart Request Conflict";
  const body = `Your request for ${calendarName} from ${start.toLocaleString()} to ${end.toLocaleString()} could not be completed due to a scheduling conflict.\n\nConflicting Event ID: ${eventId}\nPlease try a different time or cart.`;
  MailApp.sendEmail(email, subject, body);
}
