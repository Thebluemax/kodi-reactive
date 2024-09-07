import { ArrayToStringPipe } from './array-to-string.pipe';

describe('ArrayToStringPipe', () => {
  it('create an instance', () => {
    const pipe = new ArrayToStringPipe();

    expect(pipe).toBeTruthy();
  });

  it('should return empty string if is undefined', () => {
    const pipe = new ArrayToStringPipe();
    const value = pipe.transform(undefined);

    expect(value).toBe('');
  });

  it('should return empty string if is empty array', () => {
    const pipe = new ArrayToStringPipe();
    const value = pipe.transform([]);

    expect(value).toBe('');
  });

  it('should return "a" if is ["a"]', () => {
    const pipe = new ArrayToStringPipe();
    const value = pipe.transform(['a']);

    expect(value).toBe('a');
  });

  it('should return "a, b" if is ["a", "b"]', () => {
    const pipe = new ArrayToStringPipe();
    const value = pipe.transform(['a', 'b']);

    expect(value).toBe('a, b');
  });
});
