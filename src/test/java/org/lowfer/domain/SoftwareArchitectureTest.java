package org.lowfer.domain;

import io.vavr.control.Try;
import org.junit.jupiter.api.Test;
import org.lowfer.domain.common.SoftwareArchitecture;
import org.lowfer.domain.common.SoftwareComponent;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.lowfer.domain.SoftwareArchitectureMother.*;

class SoftwareArchitectureTest {

    @Test
    void testDependencyNotFound() {
        final SoftwareComponent c1 = SoftwareComponentMother.single("c1", Set.of("unknown"));
        final Try<SoftwareArchitecture> architecture = SoftwareArchitecture.of("archi", Set.of(c1), false);
        final String errorMessage = architecture.getCause().getMessage().toLowerCase();
        assertTrue(errorMessage.contains("unknown"));
        assertTrue(errorMessage.contains("does not exist"));
    }

    @Test
    void testConcatArchitectures() {
        final SoftwareArchitecture arch1 = new SoftwareArchitecture("arch1", Set.of(SoftwareComponentMother.single("c1")));
        final SoftwareArchitecture arch2 = new SoftwareArchitecture("arch2", Set.of(SoftwareComponentMother.single("c2")));

        final SoftwareArchitecture concated = arch1.concat(arch2);
        assertEquals("arch1+arch2", concated.getName());
        assertEquals(2, concated.getComponents().size());
        assertTrue(concated.getComponents().stream().anyMatch(component -> component.getName().equals("c1")));
        assertTrue(concated.getComponents().stream().anyMatch(component -> component.getName().equals("c2")));
    }

    @Test
    @SuppressWarnings("PointlessArithmeticExpression")
    void testInstability() {
        final SoftwareArchitecture architecture = simple();

        final SoftwareComponent front = architecture.findComponentByName(FRONT).orElseThrow();
        final SoftwareComponent apiFront = architecture.findComponentByName(API_FRONT).orElseThrow();
        final SoftwareComponent apiBack = architecture.findComponentByName(API_BACK).orElseThrow();
        final SoftwareComponent bdd = architecture.findComponentByName(BDD).orElseThrow();

        assertEquals(2d / (0 + 2), architecture.instability(front).getDoubleValue());
        assertEquals(2d / (1 + 2), architecture.instability(apiFront).getDoubleValue());
        assertEquals(0d / (1 + 0), architecture.instability(apiBack).getDoubleValue());
        assertEquals(0d / (1 + 0), architecture.instability(bdd).getDoubleValue());
    }
}
