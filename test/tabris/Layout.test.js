import ClientStub from './ClientStub';
import {expect, mockTabris, stub, spy, restore} from '../test';
import Layout from '../../src/tabris/Layout';
import LayoutData from '../../src/tabris/LayoutData';
import WidgetCollection from '../../src/tabris/WidgetCollection';
import Composite from '../../src/tabris/widgets/Composite';

describe('Layout', function() {

  describe('checkConsistency', function() {

    function check(layoutData) {
      return Layout.checkConsistency(LayoutData.from(layoutData));
    }

    beforeEach(function() {
      stub(console, 'warn');
    });

    afterEach(restore);

    it('raises a warning for inconsistent layoutData (width)', function() {
      check({top: 0, left: 0, right: 0, width: 100});

      let warning = 'Inconsistent layoutData: left and right are set, ignore width';
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it('overrides properties from layoutData (width)', function() {
      let result = check({top: 0, left: 0, right: 0, width: 100});

      expect(result).to.deep.equal(LayoutData.from({top: 0, left: 0, right: 0}));
    });

    it('raises a warning for inconsistent layoutData (height)', function() {
      check({top: 0, left: 0, bottom: 0, height: 100});

      let warning = 'Inconsistent layoutData: top and bottom are set, ignore height';
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it('skips overridden properties from layoutData (height)', function() {
      let result = check({top: 0, left: 0, bottom: 0, height: 100});

      expect(result).to.deep.equal(LayoutData.from({top: 0, left: 0, bottom: 0}));
    });

    it('raises a warning for inconsistent layoutData (centerX)', function() {
      check({top: 0, left: 0, centerX: 0});

      let warning = 'Inconsistent layoutData: centerX overrides left and right';
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it('skips overridden properties from layoutData (centerX)', function() {
      let result = check({top: 1, left: 2, right: 3, centerX: 4});

      expect(result).to.deep.equal(LayoutData.from({top: 1, centerX: 4}));
    });

    it('raises a warning for inconsistent layoutData (centerY)', function() {
      check({left: 0, top: 0, centerY: 0});

      let warning = 'Inconsistent layoutData: centerY overrides top and bottom';
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it('skips overridden properties from layoutData (centerY)', function() {
      let result = check({left: 1, top: 2, bottom: 3, centerY: 4});

      expect(result).to.deep.equal(LayoutData.from({left: 1, centerY: 4}));
    });

    it('raises a warning for inconsistent layoutData (baseline)', function() {
      check({left: 0, top: 0, baseline: '#other'});

      let warning = 'Inconsistent layoutData: baseline overrides top, bottom, and centerY';
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it('skips overridden properties from layoutData (baseline)', function() {
      let result = check({left: 1, top: 2, bottom: 3, centerY: 4, baseline: 'Other'});

      expect(result).to.deep.equal(LayoutData.from({left: 1, baseline: 'Other'}));
    });

  });

  describe('resolveReferences', function() {

    class TestWidget extends Composite {
      get _nativeType() {
        return 'TestType';
      }
      _acceptChild() {
        return true;
      }
    }

    function resolve(layoutData, targetWidget) {
      return Layout.resolveReferences(LayoutData.from(layoutData), targetWidget);
    }

    let parent, widget, other;

    beforeEach(function() {
      mockTabris(new ClientStub());
      parent = new TestWidget();
      widget = new TestWidget().appendTo(parent);
      other = new TestWidget({id: 'other'}).appendTo(parent);
    });

    it('translates widget to ids', function() {
      let input = {right: other, left: [other, 42]};
      let expected = {right: [other.cid, 0], left: [other.cid, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it('translates selectors to ids', function() {
      let input = {baseline: '#other', left: ['#other', 42]};
      let expected = {baseline: other.cid, left: [other.cid, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it("translates 'prev()' selector to id", function() {
      let input = {baseline: 'prev()', left: ['prev()', 42]};
      let expected = {baseline: widget.cid, left: [widget.cid, 42]};

      expect(resolve(input, other)).to.deep.equal(expected);
    });

    it("translates 'prev()' when parent children() is overwritten", function() {
      parent.children = () => new WidgetCollection([]);
      let input = {baseline: 'prev()', left: ['prev()', 42]};
      let expected = {baseline: widget.cid, left: [widget.cid, 42]};

      expect(resolve(input, other)).to.deep.equal(expected);
    });

    it("translates 'prev()' selector to 0 on first widget", function() {
      let input = {baseline: 'prev()', left: ['prev()', 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it("translates 'next()' selector to id", function() {
      let input = {baseline: 'next()', left: ['next()', 42]};
      let expected = {baseline: other.cid, left: [other.cid, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it("translates 'next()' selector to id when parent children() is overwritten", function() {
      parent.children = () => new WidgetCollection([]);
      let input = {baseline: 'next()', left: ['next()', 42]};
      let expected = {baseline: other.cid, left: [other.cid, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it("translates 'next()' selector to 0 on last widget", function() {
      let input = {baseline: 'next()', left: ['next()', 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, other)).to.deep.equal(expected);
    });

    it('does not modify numbers', function() {
      let input = {centerX: 23, left: ['30%', 42]};
      let expected = {centerX: 23, left: [30, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it('replaces unresolved selector (due to missing sibling) with 0', function() {
      other.dispose();

      let input = {baseline: '#other', left: ['#other', 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it('replaces unresolved selector (due to missing parent) with 0', function() {
      widget = new TestWidget();

      let input = {baseline: '#other', left: ['#other', 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it('replaces widget itself with 0', function() {
      let input = {baseline: widget, left: [widget, 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it('replaces ref to widget itself with 0', function() {
      widget.id = 'myself';

      let input = {baseline: '#myself', left: ['#myself', 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it('replaces non-siblings with 0', function() {
      let child = new TestWidget().appendTo(widget);

      let input = {baseline: parent, left: [child, 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

    it('replaces refs to non-siblings with 0', function() {
      new TestWidget({id: 'child'}).appendTo(widget);

      let input = {baseline: '#parent', left: ['#child', 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).to.deep.equal(expected);
    });

  });

  describe('layoutQueue', function() {

    it("calls '_flushLayout' on registered widgets once", function() {
      let widget = {
        _flushLayout: spy()
      };
      Layout.addToQueue(widget);

      Layout.flushQueue(widget);
      Layout.flushQueue(widget);

      expect(widget._flushLayout).to.have.been.calledOnce;
    });

  });

});
