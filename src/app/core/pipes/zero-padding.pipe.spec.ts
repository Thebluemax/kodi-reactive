import { ZeroPaddingPipe } from './zero-padding.pipe';

describe('ZeroPaddingPipe', () => {
  it('create an instance', () => {
    const pipe = new ZeroPaddingPipe();

    expect(pipe).toBeTruthy();
  });

  it('should return 00 if is undefined', () => {
    const pipe = new ZeroPaddingPipe();
    const value = pipe.transform(undefined);

    expect(value).toBe('00');
  });

  it('should return 01 if is 1', () => {
    const pipe = new ZeroPaddingPipe();
    const value = pipe.transform(1);

    expect(value).toBe('01');
  });

  it('should return 10 if is 10', () => {
    const pipe = new ZeroPaddingPipe();
    const value = pipe.transform(10);

    expect(value).toBe('10');
  });
});
