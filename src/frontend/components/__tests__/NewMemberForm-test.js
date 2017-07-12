import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import NewMemberForm from '../NewMemberForm.jsx';

describe('NewMemberForm', () => {
    it('should exist', () => {
        spyOn(location, 'search').and.returnValue('d');
        let newMemberForm = TestUtils.renderIntoDocument(<NewMemberForm />);

        expect(TestUtils.isCompositeComponent(newMemberForm)).toBeTruthy();
    });

    it('initially shows the membership type step', () => {
        spyOn(location, 'search').and.returnValue('s');
        let newMemberForm = TestUtils.renderIntoDocument(<NewMemberForm />);

        var heading = TestUtils.findRenderedDOMComponentWithTag(newMemberForm, 'h1');
        expect(ReactDOM.findDOMNode(heading).textContent).toBe('Membership Type');
    });

    it('initially shows the finish page if paypalFinish step is true', () => {
        spyOn(location, 'search').and.returnValue('?tx=1234');
        let newMemberForm = TestUtils.renderIntoDocument(<NewMemberForm />);


        var heading = TestUtils.findRenderedDOMComponentWithTag(newMemberForm, 'h1');
        expect(ReactDOM.findDOMNode(heading).textContent).toBe('Finish');
    });
});
