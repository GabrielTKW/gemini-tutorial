import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Mock database of flights
const flightDatabase = [
  { flightId: "AA123", airline: "American Airlines", origin: "New York (JFK)", destination: "Los Angeles (LAX)", departureTime: "2025-04-15T08:30:00", arrivalTime: "2025-04-15T12:15:00", price: 420, seats: 24 },
  { flightId: "DL456", airline: "Delta", origin: "New York (JFK)", destination: "Los Angeles (LAX)", departureTime: "2025-04-15T11:45:00", arrivalTime: "2025-04-15T15:20:00", price: 385, seats: 12 },
  { flightId: "UA789", airline: "United", origin: "New York (LGA)", destination: "Los Angeles (LAX)", departureTime: "2025-04-15T14:00:00", arrivalTime: "2025-04-15T17:45:00", price: 410, seats: 8 }
];

// Function to search for flights
async function searchFlights(origin, destination, date) {
  const results = flightDatabase.filter(
    flight => 
      flight.origin.toLowerCase().includes(origin.toLowerCase()) && 
      flight.destination.toLowerCase().includes(destination.toLowerCase()) &&
      (date ? flight.departureTime.startsWith(date) : true)
  );
  
  return results;
}

// Function to book a flight
async function bookFlight(flightId, passengerName, seatPreference) {
  const flight = flightDatabase.find(f => f.flightId === flightId);
  
  if (!flight) {
    return {
      success: false,
      message: "Flight not found"
    };
  }
  
  // In a real system, you'd save this booking to a database
  const bookingReference = "BK" + Math.floor(Math.random() * 10000);
  return {
    success: true,
    bookingReference: bookingReference,
    flightDetails: flight,
    passengerName: passengerName,
    seatPreference: seatPreference,
    message: `Flight booked successfully. Booking reference: ${bookingReference}`
  };
}

// Function declarations for Gemini
const searchFlightsFunctionDeclaration = {
  name: "searchFlights",
  parameters: {
    type: "OBJECT",
    description: "Search for available flights between cities on a specific date",
    properties: {
      origin: {
        type: "STRING",
        description: "Departure city",
      },
      destination: {
        type: "STRING",
        description: "Destination city",
      },
      date: {
        type: "STRING",
        description: "Date of travel in YYYY-MM-DD format",
      },
    },
    required: ["origin", "destination"],
  },
};

const bookFlightFunctionDeclaration = {
  name: "bookFlight",
  parameters: {
    type: "OBJECT",
    description: "Book a specific flight",
    properties: {
      flightId: {
        type: "STRING",
        description: "ID of the flight to book",
      },
      passengerName: {
        type: "STRING",
        description: "Full name of the passenger",
      },
      seatPreference: {
        type: "STRING",
        description: "Preferred seat type (window, aisle, or no preference)",
      },
    },
    required: ["flightId", "passengerName"],
  },
};

// Map of functions that can be called
const functions = {
  searchFlights: ({ origin, destination, date }) => {
    console.log(`Searching for flights from ${origin} to ${destination} on ${date}`);
    return searchFlights(origin, destination, date);
  },
  bookFlight: ({ flightId, passengerName, seatPreference }) => {
    console.log(`Booking flight ${flightId} for ${passengerName} with ${seatPreference} seat preference`);
    return bookFlight(flightId, passengerName, seatPreference || "no preference");
  }
};

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generativeModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  tools: {
    functionDeclarations: [
      searchFlightsFunctionDeclaration,
      bookFlightFunctionDeclaration
    ],
  },
});

// Run the flight booking process
async function handleFlightBooking(userPrompt) {
  try {
    console.log("User prompt:", userPrompt);
    
    const chat = generativeModel.startChat();
    
    // Send initial user prompt
    let result = await chat.sendMessage(userPrompt);
    let functionCall = result.response.functionCalls()[0];
    
    console.log("Initial Gemini response: ");
    if (functionCall) {
      console.log(`Function call detected: ${functionCall.name}`);
      console.log(`Arguments:`, functionCall.args);
      
      // Execute the function
      const functionResponse = await functions[functionCall.name](functionCall.args);
      console.log("Function response:", JSON.stringify(functionResponse, null, 2));
      
      // The exact format expected by Gemini API, iterating it as an array
      result = await chat.sendMessage([
        {
          functionResponse: {
            name: functionCall.name,
            response: {
              content: JSON.stringify(functionResponse)
            }
          }
        }
      ]);
      

      console.log("Gemini response after function call:", result.response.text());
      
      result = await chat.sendMessage("I will choose the first one");

      // Check if Gemini wants to make another function call
      functionCall = result.response.functionCalls()[0];
      
      if (functionCall) {
        console.log(`Second function call detected: ${functionCall.name}`);
        console.log(`Arguments:`, functionCall.args);
        
        // Execute the second function
        const secondFunctionResponse = await functions[functionCall.name](functionCall.args);
        console.log("Second function response:", JSON.stringify(secondFunctionResponse, null, 2));
        
        // Send second function response back to Gemini with the correct format
        result = await chat.sendMessage([
          {
            functionResponse: {
              name: functionCall.name,
              response: {
                content: JSON.stringify(secondFunctionResponse)
              }
            }
          }
        ]);
        
        console.log("Final Gemini response:", result.response.text());
      }
      
      return result.response.text();
    } else {
      console.log("No function call detected. Text response:", result.response.text());
      return result.response.text();
    }
  } catch (error) {
    console.error("Error in flight booking process:", error);
    return `An error occurred: ${error.message}`;
  }
}

// Example usage
const userPrompt = "I want to fly from New York to Los Angeles on April 15, 2025. My name is John Smith and I prefer window seats.";
handleFlightBooking(userPrompt)
  .then(response => {
    console.log("Final response to user:");
    console.log(response);
  })
  .catch(error => {
    console.error("Error:", error);
  });