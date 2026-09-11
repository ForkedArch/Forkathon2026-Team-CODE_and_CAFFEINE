#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <thread>
#include <chrono>
#include <algorithm>

using namespace std;

const string PASSWORD_FILE = "password.txt";

// Rule Check: Length > 10, contains special characters (!@#$%^&*), and letters/digits
bool isValidPassword(const string& pwd) {
    if (pwd.length() <= 10) return false;

    string specialChars = "!@#$%^&*";
    bool hasSpecial = false;
    bool hasAlphaNum = false;

    for (char c : pwd) {
        if (specialChars.find(c) != string::npos) {
            hasSpecial = true;
        } else if (isalnum(c)) {
            hasAlphaNum = true;
        }
    }

    return hasSpecial && hasAlphaNum;
}

// Calculate similarity between input password and stored password
bool isAtLeastSixtyPercentMatch(const string& input, const string& actual) {
    if (actual.empty()) return false;

    int matches = 0;
    int minLen = min(input.length(), actual.length());

    for (size_t i = 0; i < minLen; ++i) {
        if (input[i] == actual[i]) {
            matches++;
        }
    }

    double matchPercentage = (static_cast<double>(matches) / actual.length()) * 100.0;
    cout << "Matching accuracy: " << matchPercentage << "%\n";
    return matchPercentage >= 60.0;
}

// Save password to text file
void savePassword(const string& pwd) {
    ofstream outFile(PASSWORD_FILE);
    if (outFile.is_open()) {
        outFile << pwd;
        outFile.close();
    }
}

// Read saved password from text file
string loadPassword() {
    ifstream inFile(PASSWORD_FILE);
    string pwd = "";
    if (inFile.is_open()) {
        inFile >> pwd;
        inFile.close();
    }
    return pwd;
}

// Prompt user to set a valid password
void setInitialPassword() {
    string pwd;
    while (true) {
        cout << "Set a new password (Length > 10, mix of letters, numbers, and symbols like !@#$%^&*):\n> ";
        cin >> pwd;

        if (isValidPassword(pwd)) {
            savePassword(pwd);
            cout << "Password successfully set and saved!\n\n";
            break;
        } else {
            cout << "Weak password. Please mix special symbols like !@#$%^&* etc. and ensure length is greater than 10.\n\n";
        }
    }
}

// User Authentication with lockout mechanism
bool authenticate() {
    string storedPwd = loadPassword();
    int attempts = 0;
    string inputPwd;

    while (attempts < 3) {
        cout << "Enter your password: ";
        cin >> inputPwd;

        if (inputPwd == storedPwd) {
            cout << "Authentication successful!\n";
            return true;
        } else {
            attempts++;
            cout << "Incorrect password. Attempt " << attempts << " of 3.\n";
        }
    }

    cout << "\n[!] 3 wrong attempts detected. System locked for 1 minute. Please wait...\n";
    std::this_thread::sleep_for(std::chrono::minutes(1));
    cout << "System unlocked. Please try again.\n\n";
    return false;
}

// Change Password menu
void changePassword() {
    cout << "\n--- Change Password ---\n";
    if (authenticate()) {
        setInitialPassword();
    } else {
        cout << "Authentication failed. Cannot change password.\n";
    }
}

// Forgot Password feature based on 60% accuracy match
void forgotPassword() {
    cout << "\n--- Forgot Password Recovery ---\n";
    string storedPwd = loadPassword();
    string guessedPwd;

    cout << "Enter your best guess of your previous password:\n> ";
    cin >> guessedPwd;

    if (isAtLeastSixtyPercentMatch(guessedPwd, storedPwd)) {
        cout << "Verification passed (>= 60% correct). You may now set a new password.\n";
        setInitialPassword();
    } else {
        cout << "Verification failed (< 60% correct). The system will not switch to change the password.\n";
    }
}

int main() {
    // If no password exists yet, force setup
    if (loadPassword().empty()) {
        cout << "No password found in system.\n";
        setInitialPassword();
    }

    int choice;
    while (true) {
        cout << "\n===============================\n";
        cout << "   PASSWORD SYSTEM MENU        \n";
        cout << "===============================\n";
        cout << "1. Authenticate\n";
        cout << "2. Change Password\n";
        cout << "3. Forgot Password\n";
        cout << "4. Exit\n";
        cout << "Select an option: ";
        cin >> choice;

        switch (choice) {
            case 1:
                authenticate();
                break;
            case 2:
                changePassword();
                break;
            case 3:
                forgotPassword();
                break;
            case 4:
                cout << "Exiting program. Goodbye!\n";
                return 0;
            default:
                cout << "Invalid choice. Try again.\n";
        }
    }
    return 0;
}