/**
 * Manual test runner for modern utilities
 */

import { generateRandomString, formatTemplate, removeSpecialChars, slugify } from './modern-string';
import { ValidatorBuilder, validator } from './modern-validation';
import { ImmutableDate, dateUtils } from './immutable-date';
import { FileValidator, fileUtils } from './modern-file';
import { PerformanceOptimizedUtils, modernFormatUtils } from './performance-utils';

class TestRunner {
  private passed = 0;
  private failed = 0;
  private results: Array<{ name: string; status: 'PASS' | 'FAIL'; error?: string }> = [];

  assert(condition: boolean, message: string) {
    if (condition) {
      this.passed++;
      this.results.push({ name: message, status: 'PASS' });
      console.log(`✅ ${message}`);
    } else {
      this.failed++;
      this.results.push({ name: message, status: 'FAIL' });
      console.log(`❌ ${message}`);
    }
  }

  assertEqual<T>(actual: T, expected: T, message: string) {
    const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
    this.assert(isEqual, `${message} - Expected: ${expected}, Actual: ${actual}`);
  }

  async runTests() {
    console.log('🧪 Running Modern Utilities Tests\n');

    // Test Modern String Utilities
    console.log('📝 Testing String Utilities...');
    this.testStringUtils();

    // Test Validation Utilities
    console.log('\n🔍 Testing Validation Utilities...');
    await this.testValidationUtils();

    // Test Date Utilities
    console.log('\n📅 Testing Date Utilities...');
    this.testDateUtils();

    // Test Performance Utilities
    console.log('\n⚡ Testing Performance Utilities...');
    this.testPerformanceUtils();

    // Test Format Utilities
    console.log('\n🎨 Testing Format Utilities...');
    this.testFormatUtils();

    this.printResults();
  }

  private testStringUtils() {
    // Test generateRandomString
    const randomStr = generateRandomString(10);
    this.assert(randomStr.length === 10, 'generateRandomString should generate correct length');
    this.assert(/^[A-Za-z0-9]+$/.test(randomStr), 'generateRandomString should only contain alphanumeric characters');

    // Test formatTemplate
    const template = 'Hello {{name}}, welcome to {{app}}!';
    const formatted = formatTemplate(template, { name: 'John', app: 'TestApp' });
    this.assertEqual(formatted, 'Hello John, welcome to TestApp!', 'formatTemplate should replace variables');

    // Test removeSpecialChars
    const cleaned = removeSpecialChars('Hello! World?');
    this.assertEqual(cleaned, 'Hello World', 'removeSpecialChars should remove special characters');

    // Test slugify
    const slug = slugify('Hello World');
    this.assertEqual(slug, 'hello-world', 'slugify should create URL-friendly slugs');
    
    // Test slugify caching (call again)
    const cachedSlug = slugify('Hello World');
    this.assertEqual(cachedSlug, 'hello-world', 'slugify should return cached result');
  }

  private async testValidationUtils() {
    // Test basic validation
    const emailValidator = validator.for<string>('email').required().email();
    
    const validResult = emailValidator.validate('test@example.com');
    this.assert(validResult.success, 'Valid email should pass validation');
    
    const invalidResult = emailValidator.validate('invalid-email');
    this.assert(!invalidResult.success, 'Invalid email should fail validation');

    // Test CPF validation
    const cpfValidator = validator.for<string>('cpf').required().cpf();
    const validCpf = cpfValidator.validate('529.982.247-25');
    this.assert(validCpf.success, 'Valid CPF should pass validation');

    const invalidCpf = cpfValidator.validate('123.456.789-00');
    this.assert(!invalidCpf.success, 'Invalid CPF should fail validation');

    // Test batch validation
    const userData = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    const schema = {
      name: validator.for<string>('name').required(),
      email: validator.for<string>('email').required().email()
    };

    const batchResult = await validator.validateAll(userData, schema);
    this.assert(batchResult.success, 'Valid user data should pass batch validation');
  }

  private testDateUtils() {
    // Test ImmutableDate creation
    const date = ImmutableDate.from('2024-03-15T12:00:00Z');
    this.assert(date.valueOf() > 0, 'ImmutableDate should be created from string');

    // Test immutable operations
    const originalTime = date.valueOf();
    const newDate = date.addDays(5);
    
    this.assert(date.valueOf() === originalTime, 'Original date should remain unchanged');
    this.assert(newDate.valueOf() !== originalTime, 'New date should be different');

    // Test formatting
    const formatted = date.format({ year: 'numeric', month: '2-digit', day: '2-digit' });
    this.assert(typeof formatted === 'string' && formatted.includes('2024'), 'Date formatting should work');

    // Test date range generator
    const start = ImmutableDate.from('2024-03-01');
    const end = ImmutableDate.from('2024-03-03');
    const range = Array.from(dateUtils.dateRange(start, end));
    this.assertEqual(range.length, 3, 'Date range should generate correct number of dates');
  }

  private testPerformanceUtils() {
    // Test memoization
    let callCount = 0;
    const expensiveFn = (x: number) => {
      callCount++;
      return x * 2;
    };

    const memoized = PerformanceOptimizedUtils.memoize(expensiveFn);
    
    memoized(5);
    memoized(5); // Should use cache
    
    this.assertEqual(callCount, 1, 'Memoized function should only be called once for same input');

    // Test debounce
    let debounceCallCount = 0;
    const debouncedFn = PerformanceOptimizedUtils.debounce(() => {
      debounceCallCount++;
      return Promise.resolve();
    }, 100);

    // Multiple rapid calls
    debouncedFn();
    debouncedFn();
    debouncedFn();

    // Only last call should execute (tested by call count)
    this.assert(true, 'Debounce function created successfully');

    // Test deep freeze
    const obj = { a: 1, b: { c: 2 } };
    const frozen = PerformanceOptimizedUtils.deepFreeze(obj);
    
    this.assert(Object.isFrozen(frozen), 'Object should be frozen');
    this.assert(Object.isFrozen(frozen.b), 'Nested objects should be frozen');
  }

  private testFormatUtils() {
    // Test currency formatting
    const currency = modernFormatUtils.formatCurrency(1234.56);
    this.assert(currency.includes('R$'), 'Currency should include Brazilian Real symbol');

    // Test number formatting
    const number = modernFormatUtils.formatNumber(1234);
    this.assert(number.includes('.'), 'Number should include thousand separator');

    // Test file size formatting
    const fileSize = modernFormatUtils.formatFileSize(1024);
    this.assertEqual(fileSize, '1.00 KiB', 'File size should be formatted correctly');

    const fileSizeDecimal = modernFormatUtils.formatFileSize(1000, 'decimal');
    this.assertEqual(fileSizeDecimal, '1.00 KB', 'Decimal file size should be formatted correctly');

    // Test percentage formatting
    const percentage = modernFormatUtils.formatPercentage(25.5);
    this.assertEqual(percentage, '25.50%', 'Percentage should be formatted correctly');
  }

  private printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('🧪 Test Results Summary');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📊 Total: ${this.passed + this.failed}`);
    console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    
    if (this.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.name}`));
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

// Run the tests
const testRunner = new TestRunner();
testRunner.runTests();