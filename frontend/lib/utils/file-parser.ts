import * as XLSX from "xlsx"

/**
 * Parses a CSV file and returns an array of user objects
 * @param file The CSV file to parse
 * @returns An array of user objects
 */
export async function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string
        if (!csv) {
          reject(new Error("Failed to read CSV file"))
          return
        }

        // Parse CSV
        const lines = csv.split("\n")
        const headers = lines[0].split(",").map((header) => header.trim().toLowerCase())

        // Validate required headers
        if (!headers.includes("name") || !headers.includes("email")) {
          reject(new Error('CSV file must include "name" and "email" columns'))
          return
        }

        const users = []

        // Start from line 1 (skip headers)
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue // Skip empty lines

          const values = lines[i].split(",").map((value) => value.trim())
          const user: Record<string, any> = {}

          // Map values to user object
          headers.forEach((header, index) => {
            if (index < values.length) {
              user[header] = values[index]
            }
          })

          // Set default values
          if (!user.role) user.role = "student"
          if (!user.password) user.password = generateRandomPassword(10)

          users.push(user)
        }

        resolve(users)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read CSV file"))
    }

    reader.readAsText(file)
  })
}

/**
 * Parses an Excel file and returns an array of user objects
 * @param file The Excel file to parse
 * @returns An array of user objects
 */
export async function parseExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = event.target?.result
        if (!data) {
          reject(new Error("Failed to read Excel file"))
          return
        }

        // Parse Excel
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Validate required fields
        if (jsonData.length === 0 || !("name" in jsonData[0]) || !("email" in jsonData[0])) {
          reject(new Error('Excel file must include "name" and "email" columns'))
          return
        }

        // Process users
        const users = jsonData.map((row: any) => {
          // Convert all keys to lowercase
          const user: Record<string, any> = {}
          Object.keys(row).forEach((key) => {
            user[key.toLowerCase()] = row[key]
          })

          // Set default values
          if (!user.role) user.role = "student"
          if (!user.password) user.password = generateRandomPassword(10)

          return user
        })

        resolve(users)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read Excel file"))
    }

    reader.readAsArrayBuffer(file)
  })
}

// Import the password generator
import { generateRandomPassword } from "./password"
