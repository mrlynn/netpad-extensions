// scripts/testNetPadIntegration.js
require('dotenv').config();
const { NetPadApiClient } = require('../common/apiClient');

class NetPadTester {
  constructor() {
    this.client = null;
    this.testResults = [];
  }

  /**
   * Initialize the test environment
   */
  async initialize() {
    console.log('🚀 Initializing NetPad API Tests...\n');

    try {
      this.client = new NetPadApiClient({
        enableLogging: true
      });
      console.log('✅ API client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize API client:', error.message);
      throw error;
    }
  }

  /**
   * Add test result
   */
  addResult(testName, success, message, data = null) {
    this.testResults.push({
      test: testName,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Test connection to NetPad API
   */
  async testConnection() {
    console.log('🔍 Testing API connection...');
    
    try {
      const result = await this.client.testConnection();
      
      if (result.success) {
        console.log('✅ Connection test passed');
        this.addResult('Connection Test', true, 'Successfully connected to NetPad API');
      } else {
        console.log('❌ Connection test failed:', result.message);
        this.addResult('Connection Test', false, result.message);
      }
    } catch (error) {
      console.log('❌ Connection test failed:', error.message);
      this.addResult('Connection Test', false, error.message);
    }
  }

  /**
   * Test fetching available tools
   */
  async testGetTools() {
    console.log('\n🛠️  Testing tool discovery...');
    
    try {
      const result = await this.client.getTools();
      
      if (result && result.tools) {
        console.log(`✅ Found ${result.tools.length} tools:`);
        result.tools.forEach(tool => {
          console.log(`   • ${tool.name}: ${tool.description || 'No description'}`);
        });
        this.addResult('Tool Discovery', true, `Found ${result.tools.length} tools`, result.tools);
      } else {
        console.log('⚠️  No tools found in response');
        this.addResult('Tool Discovery', false, 'No tools found in response');
      }
    } catch (error) {
      console.log('❌ Tool discovery failed:', error.message);
      this.addResult('Tool Discovery', false, error.message);
    }
  }

  /**
   * Test code analysis with different languages and types
   */
  async testCodeAnalysis() {
    console.log('\n📊 Testing code analysis...');

    const testCases = [
      {
        name: 'JavaScript Summary',
        code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
        language: 'javascript',
        analysisType: 'summary'
      },
      {
        name: 'Python Explanation',
        code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`,
        language: 'python',
        analysisType: 'explanation'
      },
      {
        name: 'SQL Analysis',
        code: `SELECT u.name, COUNT(o.id) as order_count, SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2023-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5
ORDER BY total_spent DESC;`,
        language: 'sql',
        analysisType: 'summary'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n   Testing: ${testCase.name}`);
      
      try {
        const result = await this.client.analyzeCode(
          testCase.code,
          testCase.language,
          testCase.analysisType
        );

        if (result && result.output) {
          console.log('   ✅ Analysis successful');
          console.log(`   📄 Output: ${result.output.substring(0, 100)}...`);
          this.addResult(testCase.name, true, 'Code analysis completed', {
            outputLength: result.output.length,
            preview: result.output.substring(0, 200)
          });
        } else {
          console.log('   ⚠️  No output received');
          this.addResult(testCase.name, false, 'No output received from API');
        }
      } catch (error) {
        console.log(`   ❌ Analysis failed: ${error.message}`);
        this.addResult(testCase.name, false, error.message);
      }
    }
  }

  /**
   * Test data lineage extraction
   */
  async testDataLineage() {
    console.log('\n🌐 Testing data lineage extraction...');

    const testCode = `
# Data pipeline example
import pandas as pd
from sqlalchemy import create_engine

# Load data from database
engine = create_engine('postgresql://user:pass@localhost/db')
raw_data = pd.read_sql('SELECT * FROM customers', engine)

# Transform data
cleaned_data = raw_data.dropna()
enriched_data = cleaned_data.merge(
    pd.read_sql('SELECT * FROM orders', engine),
    on='customer_id'
)

# Aggregate
summary = enriched_data.groupby('region').agg({
    'revenue': 'sum',
    'customer_id': 'nunique'
})

# Save results
summary.to_sql('customer_summary', engine, if_exists='replace')
`;

    try {
      const result = await this.client.extractDataLineage(testCode, 'python');
      
      if (result && result.output) {
        console.log('✅ Data lineage extraction successful');
        console.log(`📄 Output: ${result.output.substring(0, 200)}...`);
        this.addResult('Data Lineage', true, 'Data lineage extraction completed', {
          outputLength: result.output.length
        });
      } else {
        console.log('⚠️  No lineage output received');
        this.addResult('Data Lineage', false, 'No output received from API');
      }
    } catch (error) {
      console.log(`❌ Data lineage extraction failed: ${error.message}`);
      this.addResult('Data Lineage', false, error.message);
    }
  }

  /**
   * Test SQL metadata lookup
   */
  async testSqlMetadata() {
    console.log('\n🗄️  Testing SQL metadata lookup...');

    const testSql = `
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO customers (name, email) VALUES 
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com');

SELECT name, email FROM customers WHERE created_at > '2023-01-01';
`;

    try {
      const result = await this.client.sqlMetadataLookup(testSql);
      
      if (result && result.output) {
        console.log('✅ SQL metadata lookup successful');
        console.log(`📄 Output: ${result.output.substring(0, 200)}...`);
        this.addResult('SQL Metadata', true, 'SQL metadata lookup completed', {
          outputLength: result.output.length
        });
      } else {
        console.log('⚠️  No metadata output received');
        this.addResult('SQL Metadata', false, 'No output received from API');
      }
    } catch (error) {
      console.log(`❌ SQL metadata lookup failed: ${error.message}`);
      this.addResult('SQL Metadata', false, error.message);
    }
  }

  /**
   * Test custom workflow execution
   */
  async testCustomWorkflow() {
    console.log('\n⚙️  Testing custom workflow...');

    const testCode = `
function processUserData(users) {
    // Security concern: No input validation
    const processed = users.map(user => {
        // Performance issue: Synchronous processing
        return {
            id: user.id,
            name: user.name.toUpperCase(),
            email: user.email.toLowerCase()
        };
    });
    
    // Memory leak: No cleanup
    return processed;
}
`;

    try {
      const result = await this.client.runWorkflow('security_audit', {
        code: testCode,
        language: 'javascript',
        fileName: 'userProcessor.js'
      });
      
      if (result && result.output) {
        console.log('✅ Custom workflow execution successful');
        console.log(`📄 Output: ${result.output.substring(0, 200)}...`);
        this.addResult('Custom Workflow', true, 'Custom workflow completed', {
          outputLength: result.output.length
        });
      } else {
        console.log('⚠️  No workflow output received');
        this.addResult('Custom Workflow', false, 'No output received from API');
      }
    } catch (error) {
      console.log(`❌ Custom workflow failed: ${error.message}`);
      this.addResult('Custom Workflow', false, error.message);
    }
  }

  /**
   * Test error handling with invalid payloads
   */
  async testErrorHandling() {
    console.log('\n🚨 Testing error handling...');

    const errorTests = [
      {
        name: 'Invalid Command Type',
        request: () => this.client.executeCommand('invalid_command', { code: 'test' })
      },
      {
        name: 'Missing Required Fields',
        request: () => this.client.executeCommand('code_analysis', {})
      },
      {
        name: 'Invalid Tool Name',
        request: () => this.client.executeTool('nonexistent_tool', {})
      }
    ];

    for (const errorTest of errorTests) {
      console.log(`\n   Testing: ${errorTest.name}`);
      
      try {
        await errorTest.request();
        console.log('   ⚠️  Expected error but got success');
        this.addResult(errorTest.name, false, 'Expected error but got success');
      } catch (error) {
        console.log(`   ✅ Error handling working: ${error.message}`);
        this.addResult(errorTest.name, true, `Error properly handled: ${error.message}`);
      }
    }
  }

  /**
   * Test payload size limits
   */
  async testPayloadLimits() {
    console.log('\n📏 Testing payload size limits...');

    // Create a large code string
    const largeCode = 'console.log("test");'.repeat(10000);

    try {
      const result = await this.client.analyzeCode(largeCode, 'javascript', 'summary');
      
      if (result && result.output) {
        console.log('✅ Large payload handled successfully');
        this.addResult('Large Payload', true, 'Large payload processed successfully');
      } else {
        console.log('⚠️  Large payload returned no output');
        this.addResult('Large Payload', false, 'No output for large payload');
      }
    } catch (error) {
      if (error.message.includes('413') || error.message.includes('too large')) {
        console.log('✅ Payload limit properly enforced');
        this.addResult('Large Payload', true, 'Payload limit properly enforced');
      } else {
        console.log(`❌ Unexpected error with large payload: ${error.message}`);
        this.addResult('Large Payload', false, error.message);
      }
    }
  }

  /**
   * Generate test report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST REPORT');
    console.log('='.repeat(60));

    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    const total = this.testResults.length;

    console.log(`\n📈 Overall Results: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(r => !r.success).forEach(result => {
        console.log(`   • ${result.test}: ${result.message}`);
      });
    }

    console.log('\n✅ Passed Tests:');
    this.testResults.filter(r => r.success).forEach(result => {
      console.log(`   • ${result.test}: ${result.message}`);
    });

    return {
      total,
      passed,
      failed,
      results: this.testResults
    };
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    await this.initialize();

    console.log('Starting comprehensive NetPad API tests...\n');

    // Run all test suites
    await this.testConnection();
    await this.testGetTools();
    await this.testCodeAnalysis();
    await this.testDataLineage();
    await this.testSqlMetadata();
    await this.testCustomWorkflow();
    await this.testErrorHandling();
    await this.testPayloadLimits();

    return this.generateReport();
  }
}

// CLI usage
if (require.main === module) {
  const tester = new NetPadTester();
  
  tester.runAllTests()
    .then(report => {
      console.log('\n🎉 Test suite completed!');
      process.exit(report.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = { NetPadTester };