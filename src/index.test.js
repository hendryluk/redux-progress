import Progress from './index';

describe('Progress.map', () => {
  describe('success', () => {
    const progress = Progress.success(10);

    test('can map result', () => {
      expect(progress.map(x => x + 5).result).toBe(15);
    });

    test('identity mapper, should return the same progress', () => {
      expect(progress.map(x => x)).toBe(progress);
    });
  })
})

describe('Composite Progress', () => {
  describe('with one element', () => {
    describe('which is none', () => {
      test('should be none', () => {
        expect(Progress.all(Progress.none)).toBe(Progress.none);
      });
    });

    describe('which is in progress', () => {
      test('should be in progress ', () => {
        expect(Progress.all(Progress.inProgress)).toBe(Progress.inProgress);
      });
    });

    describe('which is successful', () => {
      test('should be an array with one success', () => {
        const result = { k: 'val' };

        expect(Progress.all(Progress.success(result)))
          .toEqual(Progress.success([result]));
      });
    });

    describe('which is fail', () => {
      test('should be the fail', () => {
        const error = { k: 'val' };

        expect(Progress.all(Progress.fail(error)))
          .toEqual(Progress.fail(error));
      });
    });
  });

  describe('with multiple elements', () => {
    describe('containing a fail', () => {
      const composite = Progress.all(
        Progress.success({}),
        Progress.fail({a:'1'}),
        Progress.inProgress,
        Progress.none,
        Progress.success({}),
        Progress.fail({b:'2'}),
        Progress.inProgress,
        Progress.none,
      );

      test('should be fail', () => {
        expect(composite).toEqual(Progress.fail({a:'1'}));
      });
    });

    describe('containing an in progress', () => {
      const composite = Progress.all(
        Progress.success({}),
        Progress.none,
        Progress.inProgress,
        Progress.success({}),
        Progress.none,
        Progress.inProgress,
      );

      test('should be in progress', () => {
        expect(composite).toBe(Progress.inProgress);
      });
    });

    describe('containing a none', () => {
      const composite = Progress.all(
        Progress.success({}),
        Progress.none,
        Progress.success({}),
        Progress.none,
      );

      test('should be none', () => {
        expect(composite).toBe(Progress.none);
      });
    });

    describe('containing only success', () => {
      const composite = Progress.all(
        Progress.success({ a: "1" }),
        Progress.success({ b: "2" }),
      );

      test('should be in progress', () => {
        expect(composite).toEqual(Progress.success([
          { a: "1" },
          { b: "2" },
        ]));
      });
    });
  });
});