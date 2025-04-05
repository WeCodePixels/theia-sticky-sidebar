import {getOffset} from "./theia-sticky-sidebar.ts";

export function testTheiaStickySidebars() {
    const me: {
        scrollTopStep: number,
        currentScrollTop: number,
        values: null | number[],
    } = {
        scrollTopStep: 1,
        currentScrollTop: 0,
        values: null,
    };

    window.scrollTo(0, 1);
    window.scrollTo(0, 0);

    const handleScroll = () => {
        const newValues: number[] = [];

        // Get sidebar offsets.
        document.querySelectorAll('.theiaStickySidebar').forEach(element => {
            newValues.push(getOffset(element as HTMLElement).top);
        });

        if (me.values != null) {
            let ok = true;

            for (let j = 0; j < newValues.length; j++) {
                const diff = Math.abs(newValues[j] - me.values[j]);
                if (diff > 1) {
                    ok = false;

                    console.error('Offset difference for sidebar #' + (j + 1) + ' is ' + diff + 'px');

                    // Highlight sidebar.
                    (document.querySelectorAll('.theiaStickySidebar')[j] as HTMLElement).style.background = 'yellow';
                }
            }

            if (!ok) {
                // Stop test.
                window.removeEventListener('scroll', handleScroll);
                const msg = 'Bummer. Offset difference is bigger than 1px for some sidebars, which will be highlighted in yellow. Check the logs. Aborting.';
                alert(msg);
                throw new Error(msg);
            }
        }

        me.values = newValues;

        // Scroll to bottom. We don't cache ($(document).height() - $(window).height()) since it may change (e.g. after images are loaded).
        if (me.currentScrollTop < (document.documentElement.scrollHeight - window.innerHeight) && me.scrollTopStep == 1) {
            me.currentScrollTop += me.scrollTopStep;
            window.scrollTo(0, me.currentScrollTop);
        }
        // Then back up.
        else if (me.currentScrollTop > 0) {
            me.scrollTopStep = -1;
            me.currentScrollTop += me.scrollTopStep;
            window.scrollTo(0, me.currentScrollTop);
        }
        // Then stop.
        else {
            window.removeEventListener('scroll', handleScroll);

            // Used to notify Playwright.
            // eslint-disable-next-line
            (window as any).testFinishedSuccessfully = true;

            alert("Great success!");
        }
    };

    window.addEventListener('scroll', handleScroll);
}
