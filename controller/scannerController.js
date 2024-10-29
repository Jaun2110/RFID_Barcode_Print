import { getYear } from "../utils/dateUtil.js";
import { SerialPort } from "serialport";
import BwipJs from "bwip-js";
import env from 'dotenv';

// Initialize environment variables
env.config();

const printerPort = process.env.PRINTER_PORT;
console.log(`Printer port from .env: ${printerPort}`);

// List available ports to verify connection
SerialPort.list().then((ports) => {
    console.log("Available Ports:");
    ports.forEach((port) => {
      console.log(`${port.path} - ${port.manufacturer || 'Unknown Manufacturer'}`);
    });

    // Confirm if specified port is available
    const portExists = ports.some((port) => port.path === printerPort);
    if (!portExists) {
      console.error(`Port ${printerPort} not found among available ports.`);
      process.exit(1);
    } else {
      console.log(`Port ${printerPort} found. Proceeding to open port.`);
      
      // Open the port when ready
      port.open((err) => {
        if (err) {
          console.error('Failed to open port:', err.message);
        } else {
          console.log('Printer port opened successfully.');
        }
      });
    }
}).catch((err) => {
  console.error("Error listing ports:", err);
});

// Create a SerialPort instance (move this outside the callback)
const port = new SerialPort({
  path: printerPort,
  baudRate: 9600,
  autoOpen: false, // Open only when ready to print
});

// Export the renderHomePage and other functions at the top level
export const renderHomePage = async (req, res) => {
  res.render("home", { currentYear: getYear() });
};

// Controller function to handle incoming request data
export const getScanData = async (req, res) => {
  const { data } = req.body;
  console.log(`Data received: ${data}`);
  
  // Process or send data to printer
  await printBarcode(data);
  
  // Send response back to client
  res.status(200).json({ message: 'Barcode processing initiated' });
};

// Function to generate and print barcode
const printBarcode = async (data) => {
  try {
    // Generate barcode image in Code 128 format
    const barcodeBuffer = await BwipJs.toBuffer({
      bcid: 'code128',
      text: data.toString(),
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
      textsize: 5
    });

    console.log('Barcode generated. Sending to printer...');
    sendToPrinter(barcodeBuffer);

  } catch (error) {
    console.error('Error generating barcode:', error);
  }
};

// Helper function to handle writing to the printer
const sendToPrinter = (buffer) => {
  if (!port.isOpen) {
    console.error('Printer port is not open.');
    return;
  }

  const utf8Command = Buffer.from('\x1B\x74\x00', 'binary'); // ESC t 16 for UTF-8, printer specific
  const lineFeed = Buffer.from('\x0A', 'binary');            // Line feed command
  
  port.write(Buffer.concat([utf8Command, buffer, lineFeed]), (err) => {
    if (err) {
      console.error('Error writing to printer:', err.message);
    } else {
      console.log('Barcode printed successfully!');
    }
  });
};

// Handle application shutdown to close the port gracefully
process.on('SIGINT', () => {
  console.log('Closing printer port...');
  port.close((err) => {
    if (err) {
      console.error('Error closing port:', err.message);
    } else {
      console.log('Printer port closed.');
    }
    process.exit();
  });
});
