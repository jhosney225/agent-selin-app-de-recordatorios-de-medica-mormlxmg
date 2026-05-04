
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Store medicines and reminders
const medicines = new Map();
const reminders = [];

// Define tools for the medicine reminder app
const tools = [
  {
    name: "add_medicine",
    description:
      "Add a new medicine with dosage and frequency to track. Returns confirmation of added medicine.",
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the medicine",
        },
        dosage: {
          type: "string",
          description: "Dosage amount (e.g., '500mg', '2 tablets')",
        },
        frequency: {
          type: "string",
          description: "How often to take (e.g., 'twice daily', 'every 8 hours')",
        },
        times: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Times of day to take medicine (e.g., ['08:00', '14:00', '20:00'])",
        },
      },
      required: ["name", "dosage", "frequency", "times"],
    },
  },
  {
    name: "list_medicines",
    description:
      "List all medicines currently being tracked with their dosages and schedules.",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "set_reminder",
    description:
      "Set a reminder for taking a specific medicine at a specific time.",
    input_schema: {
      type: "object",
      properties: {
        medicine_name: {
          type: "string",
          description: "Name of the medicine to set reminder for",
        },
        time: {
          type: "string",
          description: "Time for the reminder in HH:MM format",
        },
        date: {
          type: "string",
          description: "Date for the reminder in YYYY-MM-DD format",
        },
      },
      required: ["medicine_name", "time", "date"],
    },
  },
  {
    name: "get_reminders",
    description: "Get all upcoming reminders for medicines.",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "check_medicine_interactions",
    description:
      "Check for potential interactions between medicines being taken.",
    input_schema: {
      type: "object",
      properties: {
        medicine_names: {
          type: "array",
          items: {
            type: "string",
          },
          description: "List of medicine names to check for interactions",
        },
      },
      required: ["medicine_names"],
    },
  },
  {
    name: "get_medicine_info",
    description: "Get information about a specific medicine.",
    input_schema: {
      type: "object",
      properties: {
        medicine_name: {
          type: "string",
          description: "Name of the medicine to get information about",
        },
      },
      required: ["medicine_name"],
    },
  },
];

// Tool implementation functions
function add_medicine(name, dosage, frequency, times) {
  const medicineKey = name.toLowerCase();
  medicines.set(medicineKey, {
    name,
    dosage,
    frequency,
    times,
    addedAt: new Date().toISOString(),
  });
  return `Successfully added ${name} (${dosage}) to be taken ${frequency} at times: ${times.join(", ")}`;
}

function list_medicines() {
  if (medicines.size === 0) {
    return "No medicines currently being tracked.";
  }

  let list = "Current medicines being tracked:\n";
  medicines.forEach((med) => {
    list += `- ${med.name}: ${med.dosage}, ${med.frequency}\n`;
    list += `  Scheduled times: ${med.times.join(", ")}\n`;
  });
  return list;
}

function set_reminder(medicine_name, time, date) {
  const medicineKey = medicine_name.toLowerCase();
  if (!medicines.has(medicineKey)) {
    return `Medicine "${medicine_name}" not found in tracked medicines.`;
  }

  const reminder = {
    medicine: medicine_name,
    time,
    date,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  reminders.push(reminder);
  return `Reminder set for ${medicine_name} on ${date} at ${time}`;
}

function get_reminders() {
  if (reminders.length === 0) {
    return "No reminders set.";
  }

  let list = "Upcoming reminders:\n";
  reminders.forEach((reminder, index) => {
    list += `${index + 1}. ${reminder.medicine} - ${reminder.date} at ${reminder.time} (${reminder.status})\n`;
  });
  return list;
}

function check_medicine_interactions(medicine_names) {
  // Simulated interaction checking
  const knownInteractions = {
    warfarin: ["aspirin", "ibuprofen", "naproxen"],
    metformin: ["alcohol", "contrast dye"],
    lisinopril: ["potassium supplements", "nsaids"],
    atorvastatin: ["clarithromycin", "erythromycin"],
  };

  let interactions = [];
  const lowerNames = medicine_names.map((n) => n.toLowerCase());

  for (let i = 0; i < lowerNames.length; i++) {
    for (let j = i + 1; j < lowerNames.length; j++) {
      if (
        knownInteractions[lowerNames[i]] &&
        knownInteractions[lowerNames[i]].includes(lowerNames[j